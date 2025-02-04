const pool = require("../db/init");
const ApiError = require("../utils/error.util");

const getProfile = async (userId) => {
    const result = await pool.query("SELECT * FROM instructors WHERE user = $1", [userId]);
    if (result.rows.length === 0) throw new ApiError(400, "Instructor profile not found");
    return result.rows[0];
};


const updateProfile = async (userId, profileData) => {
    const { experience, specialization, certifications, total_courses, average_rating, website } =
        profileData;

    const result = await pool.query(
        `UPDATE instructors 
            SET experience = COALESCE($1, experience), 
                specialization = COALESCE($2, specialization),
                certifications = COALESCE($3, certifications),
                total_courses = COALESCE($4, total_courses),
                average_rating = COALESCE($5, average_rating),
                website = COALESCE($6, website)
         WHERE user = $7 RETURNING *`,
        [experience, specialization, certifications, total_courses, average_rating, website, userId]
    );

    if (result.rows.length === 0)
        throw new ApiError(400, "Instructor profile not found or could not be updated");
    return result.rows[0];
};

module.exports = { getProfile, updateProfile };
