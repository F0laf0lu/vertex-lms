const {status} = require("http-status")
const pool = require("../db/init");
const ApiError = require("../utils/error.util");

const createCourse = async (req, res, next) => {
    try {       
        const { name, description, difficulty, ...rest } = req.body;

        const instructorResult = await pool.query('SELECT id FROM instructors WHERE "user" = $1', [req.user.id]);
        
        const result = await pool.query(
            "INSERT INTO course(name, description, difficulty, instructor) VALUES($1, $2, $3, $4) RETURNING *",
            [name, description, difficulty, instructorResult.rows[0].id]
        );

        const newCourse = result.rows[0];
        if (Object.keys(rest).length > 0) {
            const updates = [];
            const values = [newCourse.id];
            let index = 2;

            // build the UPDATE query dynamically
            for (const [key, value] of Object.entries(rest)) {
                updates.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }

            // Construct the final SQL UPDATE query
            const updateQuery = `UPDATE course SET ${updates.join(", ")} WHERE id = $1 RETURNING *`;
            const updateResult = await pool.query(updateQuery, values);

            // Return the updated course details
            return res.status(status.CREATED).json({
                success: true,
                data: updateResult.rows[0],
            });
        }

        return res.status(status.CREATED).json({
            success: true,
            data: newCourse,
        });
    } catch (error) {
        next(error);
    }
};


const getAllCourses = async(req, res, next)=>{
    try {
        const result = await pool.query("SELECT * FROM course")
        const courses = result.rows
        res.status(status.OK).json({
            success: true,
            message: "All courses fetched successfully",
            data: courses
        })
    } catch (error) {
        next(error)
    }
}


const getCourse = async(req, res, next)=>{
    try {
        const { courseId } = req.params;
        const result = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
        
        if (result.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Course not found");
        }
        const course = result.rows[0]
        res.status(status.OK).json({
            success:true,
            message: "Course details fetched",
            data: course
        })
    } catch (error) {
        next(error)
    }
}


const updateCourse = async(req, res, next)=>{
    try {
        const { courseId } = req.params;
        const fields = [];
        const data = [];
        Object.entries(req.body).map((entry, index) => {
            fields.push(`${entry[0]}=$${index + 1}`);
            data.push(entry[1]);
        });
        if (fields.length === 0) {
            throw new ApiError(status.BAD_REQUEST, "No fields to update");
        } 
        data.push(courseId);
        const updateQuery = `UPDATE course SET ${fields.join(", ")} WHERE id = $${fields.length + 1} RETURNING *`;
        const updateResult = await pool.query(updateQuery, data)
        return res.status(status.OK).json({
            success: true,
            data: updateResult.rows[0],
        });
    } catch (error) {
        next(error)
    }
}


const deleteCourse = async(req, res, next)=>{
    try {
        const { courseId } = req.params;
        await pool.query("DELETE FROM course WHERE id=$1", [id]);
        return res.status(status.NO_CONTENT).json({
            success: true,
            message: "Course deleted successfully",
            data: {},
        });
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createCourse,
    getAllCourses,
    getCourse,
    updateCourse,
    deleteCourse
};
