const pool = require("../db/init");
const ApiError = require("../utils/error.util");

const createCourseService = async (userId, courseData) => {
    const client = await pool.connect();
    try {
        const { name, description, difficulty, ...rest } = courseData;

        const instructorQuery = 'SELECT id FROM instructors WHERE "user" = $1';
        const instructorResult = await client.query(instructorQuery, [userId]);

        if (instructorResult.rows.length === 0) {
            throw new ApiError(400, "Instructor not found");
        }
        const instructorId = instructorResult.rows[0].id;

        const fields = ["name", "description", "difficulty", "instructor"];
        const values = [name, description, difficulty, instructorId];
        const placeholders = fields.map((_, i) => `$${i + 1}`);

        for (const [key, value] of Object.entries(rest)) {
            fields.push(key);
            values.push(value);
            placeholders.push(`$${values.length}`);
        }

        const insertQuery = `INSERT INTO course(${fields.join(", ")}) VALUES(${placeholders.join(", ")}) RETURNING *`;
        const result = await client.query(insertQuery, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};


const getAllCoursesService = async () => {
    const result = await pool.query("SELECT * FROM course");
    return result.rows;
};

const getCourseService = async (courseId) => {
    const result = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
    if (result.rows.length === 0) {
        throw new ApiError(404, "Course not found");
    }
    return result.rows[0];
};

const updateCourseService = async (courseId, courseData) => {
    const fields = [];
    const values = [];

    Object.entries(courseData).forEach((entry, index) => {
        fields.push(`${entry[0]}=$${index + 1}`);
        values.push(entry[1]);
    });

    if (fields.length === 0) {
        throw new ApiError(400, "No fields to update");
    }
    values.push(courseId);
    const updateQuery = `UPDATE course SET ${fields.join(", ")} WHERE id = $${
        fields.length + 1
    } RETURNING *`;
    const updateResult = await pool.query(updateQuery, values);
    return updateResult.rows[0];
};

const deleteCourseService = async (courseId) => {
    await pool.query("DELETE FROM course WHERE id=$1", [courseId]);

    return { message: "Course deleted successfully" };
};

module.exports = {
    createCourseService,
    getAllCoursesService,
    getCourseService,
    updateCourseService,
    deleteCourseService,
};