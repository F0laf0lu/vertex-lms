const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });



const createCourseService = async (userId, courseData) => {
    const { name, description, difficulty, ...rest } = courseData;
    const instructorResult = await pool.query('SELECT id FROM instructors WHERE "user" = $1', [
        userId,
    ]);
    if (instructorResult.rows.length === 0) {
        throw new ApiError(400, "Instructor not found");
    }
    const result = await pool.query(
        "INSERT INTO course(name, description, difficulty, instructor) VALUES($1, $2, $3, $4) RETURNING *",
        [name, description, difficulty, instructorResult.rows[0].id]
    );

    const newCourse = result.rows[0];
    if (Object.keys(rest).length > 0) {
        const updates = [];
        const values = [newCourse.id];
        let index = 2;

        for (const [key, value] of Object.entries(rest)) {
            updates.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }

        const updateQuery = `UPDATE course SET ${updates.join(", ")} WHERE id = $1 RETURNING *`;
        const updateResult = await pool.query(updateQuery, values);
        return updateResult.rows[0];
    }
    return newCourse;
};

const getAllCourses = async () => {
    const result = await pool.query("SELECT * FROM course");
    return result.rows;
};

const getCourseById = async (courseId) => {
    const result = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
    if (result.rows.length === 0) {
        throw new ApiError(404, "Course not found");
    }
    return result.rows[0];
};

const updateCourse = async (courseId, courseData) => {
    const fields = [];
    const data = [];
    Object.entries(courseData).forEach((entry, index) => {
        fields.push(`${entry[0]}=$${index + 1}`);
        data.push(entry[1]);
    });
    if (fields.length === 0) {
        throw new ApiError(400, "No fields to update");
    }
    data.push(courseId);
    const updateQuery = `UPDATE course SET ${fields.join(", ")} WHERE id = $${
        fields.length + 1
    } RETURNING *`;
    const updateResult = await pool.query(updateQuery, data);
    return updateResult.rows[0];
};

const deleteCourse = async (courseId) => {
    await pool.query("DELETE FROM course WHERE id=$1", [courseId]);
};

module.exports = {
    createCourseService,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};