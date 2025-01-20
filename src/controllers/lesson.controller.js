const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const create = require("prompt-sync");



const getLessons = async(req,res,next)=>{
    try {
        const {moduleId} = req.params
        const moduleResult = await pool.query('SELECT id FROM module WHERE id=$1', [moduleId])
        if (moduleResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }
        const lessonResult = await pool.query("SELECT * FROM lessons WHERE module=$1", [moduleId])
        if (lessonResult.rows.length === 0) {
            return res.status(status.OK).json({
                success: true,
                message: "No lessons found for this module",
                data: [],
            });
        }
        res.status(status.OK).json({
            success: true,
            message: "Module lessons fetched successfully",
            data:lessonResult.rows
        })
    } catch (error) {
        next(error)
    }
}

const createLesson = async (req, res, next) => {
    try {
        const { moduleId } = req.params;
        const { name } = req.body;

        const moduleResult = await pool.query("SELECT id FROM module WHERE id=$1", [moduleId]);
        if (moduleResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }

        const lessonResult = await pool.query(
            "INSERT INTO lessons (name, module) VALUES ($1, $2) RETURNING *",
            [name, moduleId]
        );

        res.status(status.CREATED).json({
            success: true,
            message: "Lesson created successfully",
            data: lessonResult.rows[0],
        });
    } catch (error) {
        next(error);
    }
};



const getLesson = async (req, res, next) => {
    try {
        const { moduleId, lessonId } = req.params; 

        const moduleResult = await pool.query("SELECT id FROM module WHERE id=$1", [moduleId]);
        if (moduleResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }
        const lessonResult = await pool.query("SELECT * FROM lessons WHERE id=$1 AND module=$2", [
            lessonId,
            moduleId,
        ]);
        if (lessonResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Lesson not found in the specified module");
        }
        res.status(status.OK).json({
            success: true,
            message: "Lesson fetched successfully",
            data: lessonResult.rows[0],
        });
    } catch (error) {
        next(error); 
    }
};


const updateLesson = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const result = await pool.query("SELECT * FROM lessons WHERE id=$1", [lessonId]);
        if (result.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Lesson not found");
        }
        if (Object.keys(req.body).length === 0) {
            throw new ApiError(status.BAD_REQUEST, "No fields to update for lesson");
        }
        const fields = [];
        const values = [];
        Object.entries(req.body).forEach((entry, index) => {
            fields.push(`${entry[0]}=$${index + 1}`);
            values.push(entry[1]);
        });
        values.push(lessonId);
        const updateQuery = `UPDATE lessons SET ${fields.join(", ")} WHERE id = $${
            fields.length + 1
        } RETURNING *`;
        const updateResult = await pool.query(updateQuery, values);

        if (updateResult.rows.length === 0) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to update lesson");
        }
        return res.status(status.OK).json({
            success: true,
            data: updateResult.rows[0],
        });
    } catch (error) {
        next(error);
    }
};


const deleteLesson = async (req, res, next) => {
    try {
        const { moduleId, lessonId } = req.params;
        const moduleResult = await pool.query("SELECT id FROM module WHERE id=$1", [moduleId]);
        if (moduleResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }
        const lessonResult = await pool.query("SELECT * FROM lessons WHERE id=$1 AND module=$2", [
            lessonId,
            moduleId,
        ]);
        if (lessonResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Lesson not found in the specified module");
        }
        await pool.query("DELETE FROM lessons WHERE id=$1 AND module=$2", [lessonId, moduleId]);
        res.status(status.OK).json({
            success: true,
            message: "Lesson deleted successfully",
        });
    } catch (error) {
        next(error); 
    }
};



module.exports = {
    getLessons,
    createLesson,
    getLesson,
    updateLesson,
    deleteLesson
}