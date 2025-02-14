const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const {estimateReadingTime} = require("../utils/utils");


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
        console.log(req.body)
        const { moduleId } = req.params;
        const { name, lessontext, duration } = req.body;
        const lessonvideo = req.file ? `/uploads/${req.file.filename}` : null;

        const moduleResult = await pool.query("SELECT id FROM module WHERE id=$1", [moduleId]);
        if (moduleResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }
        const orderResult = await pool.query(
            "SELECT COUNT(*) AS lesson_count FROM lessons WHERE module=$1",
            [moduleId]
        );
        const lessonOrder = parseInt(orderResult.rows[0].lesson_count, 10) + 1;
        const query = `
            INSERT INTO lessons (name, module, lessonvideo, lessontext, duration, "order")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [name, moduleId, lessontext, lessonvideo, duration, lessonOrder];
        const { rows } = await pool.query(query, values);

        const lesson = rows[0];
        res.status(status.CREATED).json({
            success: true,
            message: "Lesson created successfully",
            data: lesson,
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
        const { name, lessontext, duration, order } = req.body;
        const lessonvideo = req.file ? `/uploads/${req.file.filename}` : null;

        // Fetch existing lesson
        const lessonResult = await pool.query("SELECT * FROM lessons WHERE id=$1", [lessonId]);
        if (lessonResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Lesson not found");
        }

        // Create an object with only the provided fields
        const fieldsToUpdate = {
            name,
            lessontext,
            duration,
            order,
            lessonvideo,
            updatedAt: new Date(), 
        };

        // Filter out undefined/null fields
        const entries = Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined);

        if (entries.length === 0) {
            return res.status(status.BAD_REQUEST).json({ message: "No fields provided for update" });
        }

        // Construct the dynamic query
        const setClause = entries.map(([key], i) => `"${key}"=$${i + 1}`).join(", ");
        const values = entries.map(([_, value]) => value);
        values.push(lessonId);

        const query = `
            UPDATE lessons
            SET ${setClause}
            WHERE id=$${values.length}
            RETURNING *;
        `;

        const { rows } = await pool.query(query, values);

        res.status(status.OK).json({
            success: true,
            message: "Lesson updated successfully",
            data: rows[0],
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