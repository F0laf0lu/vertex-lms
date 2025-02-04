const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const { generateCode } = require("../utils/utils");
const { status } = require("http-status");


const initializePayment = async ({ userId, email, courseId }) => {
    // Fetch Course
    const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
    if (courseResult.rows.length === 0) {
        throw new ApiError(status.NOT_FOUND, "Course not found");
    }
    const course = courseResult.rows[0];

    // Check if the user has already paid
    const existingPayment = await pool.query(
        "SELECT * FROM payments WHERE user_id = $1 AND course_id = $2 AND is_paid = true",
        [userId, courseId]
    );
    if (existingPayment.rowCount > 0) {
        throw new ApiError(status.BAD_REQUEST, "Payment already made for this course");
    }

    // Generate payment reference
    const reference = generateCode(10);

    // Prepare Paystack payload
    const paymentData = {
        email,
        amount: course.price * 100, 
        reference,
        metadata: {
            course_id: course.id,
            user_id: userId,
        },
    };

    // Paystack API Call
    const headers = {
        Authorization: `Bearer ${process.env.PAYSTACK_SK}`,
        "Content-Type": "application/json",
    };
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
    });

    const paystackData = await response.json();
    if (!paystackData.status) {
        throw new ApiError(status.BAD_REQUEST, paystackData.message);
    }

    // Save payment record (Mark as unpaid initially)
    const { rows } = await pool.query(
        "INSERT INTO payments (user_id, course_id, reference, is_paid) VALUES ($1, $2, $3, $4) RETURNING *",
        [userId, courseId, reference, false]
    );

    return { payment: rows[0], paystackUrl: paystackData.data.authorization_url };
};


const processPaystackWebhook = async (req) => {
    const secret = process.env.PAYSTACK_SK;
    const signature = req.headers["x-paystack-signature"];

    if (!signature) {
        throw new ApiError(status.BAD_REQUEST, "Missing Paystack signature");
    }

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");
    if (hash !== signature) {
        throw new ApiError(status.UNAUTHORIZED, "Invalid Paystack signature");
    }

    const event = req.body;
    console.log("Received Paystack Webhook Event:", event);

    if (event.event === "charge.success") {
        const transaction = event.data;

        // Update payment status in the database
        const updateResult = await pool.query(
            "UPDATE payments SET is_paid = true WHERE reference = $1 AND is_paid = false RETURNING *",
            [transaction.reference]
        );

        if (updateResult.rowCount === 0) {
            throw new ApiError(status.NOT_FOUND, "Payment not found or already processed");
        }

        return { message: "Payment processed successfully", payment: updateResult.rows[0] };
    }
    if (event.event === "charge.failed") {
        const updateResult = await pool.query(
            "UPDATE payments SET is_failed = true WHERE reference = $1 RETURNING *",
            [reference]
        );

        if (updateResult.rowCount === 0) {
            throw new ApiError(status.NOT_FOUND, "Failed payment");
        }

        return { message: "Payment failed", payment: updateResult.rows[0] };
    }
    return { message: `Unhandled event type: ${event.event}` };
};



module.exports = { initializePayment, processPaystackWebhook };
