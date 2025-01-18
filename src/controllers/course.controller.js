const {status} = require("http-status")
const pool = require("../db/init");


const createCourse = async (req, res, next) => {
    try {
        const { name, description, difficulty, ...rest } = req.body;

        const instructorResult = await pool.query('SELECT * FROM instructors WHERE "user" = $1', [req.user.id]);
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

// Pagination!

const getAllCourses = async(req, res, next)=>{
    try {
        const result = await pool.query("SELECT * FROM course")
        const courses = result.rows[0]
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
        const {id} = req.params
        const result = await pool.query("SELECT * FROM course WHERE id=$1", [id])
        
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
        const { id } = req.params;
        const {user} = req

        
        const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [id]);
        if (courseResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Course not found");
        }

        const profileResult = await pool.query('SELECT * FROM instructors WHERE "user"=$1', [
            user.id,
        ]);
        const instructorId = profileResult.rows[0].id;
        if (instructorId !== course.instructor || !user.isadmin) {
            throw new ApiError(status.FORBIDDEN, "Permission denied");
        }

        const course = result.rows[0];
        const fields = [];
        const values = [];
        let index = 1
        for([keys, values] in Object.entries(req.body)){
            fields.push(`${key} = $${index}`);
            values.push(values)
            index++
        }
        if (fields.length === 0) {
            throw new ApiError(status.BAD_REQUEST, "No fields to update");
        }
        values.push(id);
        const updateQuery = `UPDATE course SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const updateResult = await pool.query(updateQuery, values)
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
        const { id } = req.params;
        const { user } = req;
        const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [id]);
        if (courseResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Course not found");
        } 

        const profileResult = await pool.query('SELECT * FROM instructors WHERE "user"=$1', [
            user.id,
        ]);
        const instructorId = profileResult.rows[0].id;
        if (instructorId !== course.instructor && !user.isadmin) {
            throw new ApiError(status.FORBIDDEN, "Permission denied");
        }
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
