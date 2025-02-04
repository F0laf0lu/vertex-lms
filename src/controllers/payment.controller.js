const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const { generateCode } = require("../utils/utils");
const crypto = require("crypto");
const { initializePayment, processPaystackWebhook } = require("../services/payment.service");


const makePayment = async (req, res, next) => {
    try {
        const { id, email } = req.user;
        const { courseId } = req.body;

        const { payment, paystackUrl } = await initializePayment({ userId: id, email, courseId });

        return res.status(status.OK).json({
            success: true,
            message: "Payment initialized",
            data: { payment, paystackUrl },
        });
    } catch (error) {
        next(error);
    }
};

const paystackWebhook = async (req, res, next) => {
    try {
        const result = await processPaystackWebhook(req);
        res.status(status.OK).json({
            success: true,
            message: result.message,
            data: result.payment || null,
        });
    } catch (error) {
        next(error);
    }
};


const makePayment1 = async (req, res, next) => {
    
    try {
        const { id, email } = req.user;
        const { courseId } = req.body;
        
        // Fetch Course
        const result = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
        if (result.rows.length === 0) {
            throw new ApiError(404, "Course not found");
        }
        const course = result.rows[0];

        // Check if the user has already paid for this course
        const existingPayment = await pool.query(
            "SELECT * FROM payments WHERE user_id = $1 AND course_id = $2 AND is_paid = true",
            [id, courseId]
        );
        if (existingPayment.rowCount > 0) {
            throw new ApiError(status.BAD_REQUEST, "Payment already made for this course");
        }

        const reference = generateCode(10);
        const paymentData = {
            email: email,
            amount: course.price * 100,
            reference,
            metadata: {
                course_id: course.id,
                user_id: id,
            },
        };
        const headers = {
            Authorization: `BEARER ${process.env.PAYSTACK_SK}`,
            "Content-Type": "application/json",
        };
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ ...paymentData }),
        });
        // if (!response.ok) {
        //     throw new ApiError(status.BAD_REQUEST, "Failed to initialize payment");
        // }
        const paystackData = await response.json();
        if (!paystackData.status) {
            throw new Error(paystackData.message);
        }
        const newPayment = await pool.query(
            "INSERT INTO payments (user_id, course_id, reference, is_paid) VALUES ($1, $2, $3, $4) RETURNING *",
            [id, courseId, reference, false]
        );
        console.log(newPayment[0])
        return res.status(status.OK).json({
            success: true,
            message: "Payment initialized",
            data: paystackData.data,
        });
    } catch (error) {
        next(error)
    }
}
const paystackWebhook1 = async(req, res, next) => {
    const secret = process.env.PAYSTACK_SK;
    try {
        const signature = req.headers["x-paystack-signature"];
        if (!signature) {
            throw new ApiError(status.BAD_REQUEST, "Missing Paystack signature");
        }

        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash !== req.headers["x-paystack-signature"]) {
            throw new ApiError(status.BAD_REQUEST, "Invalid Paystack signature");
        }
        const event = req.body;
        console.log(event);
        if (event.event === 'charge.success'){
            const transaction = event.data;
            const updateResult = await pool.query(
                "UPDATE payments SET is_paid=true WHERE reference=$1 AND is_paid=false",
                [transaction.reference]
            );
            if (updateResult.rowCount === 0) {
                throw new ApiError(status.NOT_FOUND, "Payment not found or already processed");
            }
            return res
                .status(status.OK)
                .json({ success: true, message: "Payment processed successfully" });
        }
        
        // Handle other paystack events
        console.log(`Unhandled event type: ${event.event}`);
        
        res.status(status.OK).json({
            success: true,
            message: "Event received",
        });
    } catch (error) {
        next(error)
    }
}


module.exports = {
    makePayment,
    paystackWebhook
}