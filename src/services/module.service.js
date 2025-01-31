const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const { status } = require("http-status");

const checkCourseExists = async (courseId) => {
    const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
    if (courseResult.rows.length === 0) {
        throw new ApiError(status.NOT_FOUND, "Course not found");
    }
    return courseResult.rows[0];
};


const createModule = async (courseId, { name, description }) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN"); 

        // Count existing modules
        const orderResult = await client.query(
            "SELECT COUNT(*) AS module_count FROM module WHERE course=$1",
            [courseId]
        );
        const moduleOrder = parseInt(orderResult.rows[0].module_count, 10) + 1;

        // Insert the new module
        const moduleResult = await client.query(
            'INSERT INTO module(name, description, course, "order") VALUES($1, $2, $3, $4) RETURNING *',
            [name, description, courseId, moduleOrder]
        );

        await client.query("COMMIT"); 
        return moduleResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK"); 
        throw error;
    } finally {
        client.release(); 
    }
};

const getModulesByCourse = async (courseId) => {
    const result = await pool.query("SELECT * FROM module WHERE course=$1", [courseId]);
    return result.rows;
};


const getModuleById = async (moduleId) => {
    const result = await pool.query("SELECT * FROM module WHERE id=$1", [moduleId]);
    if (result.rows.length === 0) {
        throw new ApiError(status.NOT_FOUND, "Module not found");
    }
    return result.rows[0];
};





const updateModuleById = async (moduleId, updateFields) => {
    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(status.BAD_REQUEST, "No fields to update");
    }
    const fields = [];
    const values = [];
    Object.entries(updateFields).map((entry, index) => {
        fields.push(`${entry[0]}=$${index + 1}`);
        values.push(entry[1]);
    });
    values.push(moduleId);
    const updateQuery = `UPDATE module SET ${fields.join(", ")} WHERE id = $${
        fields.length + 1
    } RETURNING *`;
    const updateResult = await pool.query(updateQuery, values);
    if (updateResult.rows.length === 0) {
        throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to update module");
    }
    return updateResult.rows[0];
};


const deleteModuleById = async (moduleId) => {
    const result = await pool.query("SELECT * FROM module WHERE id=$1", [moduleId]);
    if (result.rows.length === 0) {
        throw new ApiError(status.NOT_FOUND, "Module not found");
    }
    await pool.query("DELETE FROM module WHERE id=$1", [moduleId]);
};

module.exports = {
    checkCourseExists,
    createModule,
    getModulesByCourse,
    getModuleById,
    updateModuleById,
    deleteModuleById,
};