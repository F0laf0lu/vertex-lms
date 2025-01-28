const pool = require("../db/init");
const ApiError = require("../utils/error.util");

const enrollService = async (userId, courseId) => {
    // Check if the payment for the course is verified
    const paymentResult = await pool.query(
        "SELECT * FROM payments WHERE user_id = $1 AND course_id = $2 AND is_paid=true",
        [userId, courseId]
    );
    if (paymentResult.rowCount === 0) {
        throw new ApiError(403, "Payment not verified for this course");
    }

    // Check if the enrollment already exists
    const checkQuery = `
            SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2
        `;
    const existingEnrollment = await pool.query(checkQuery, [userId, courseId]);

    if (existingEnrollment.rows.length > 0) {
        throw new ApiError(403, "Student is already enrolled in this course.");
    }

    // Insert enrollment
    const insertQuery = `
            INSERT INTO enrollments (user_id, course_id) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
    const result = await pool.query(insertQuery, [userId, courseId]);
    return result.rows[0];
}; 


module.exports = {
    enrollService,
};
