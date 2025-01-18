const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");


// createModule, getModules, getModule, updateModule, deleteModule;


const createModule = async(req, res, next)=>{
    try {
            const {courseId} = req.params
            const { user } = req;
            const { name, description} = req.body;
            const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
            if (courseResult.rows.length === 0) {
                throw new ApiError(status.NOT_FOUND, "Course not found");
            }
            const profileResult = await pool.query('SELECT * FROM instructors WHERE "user"=$1', [
                user.id,
            ]);
            if (profileResult.rows.length === 0) {
                throw new ApiError(status.NOT_FOUND, "User profile not found");
            }

            const course = courseResult.rows[0];
            const instructorId = profileResult.rows[0].id;
            if (instructorId !== course.instructor && !user.isadmin) {
                throw new ApiError(status.FORBIDDEN, "Permission denied");
            }
        
            const moduleResult = await pool.query(
                "INSERT INTO module(name, description, course) VALUES($1, $2, $3) RETURNING *",
                [name, description, courseId]
            );
        return res.status(status.CREATED).json({
            success: true,
            data: moduleResult.rows[0],
        });
    } catch (error) {
        next(error)
    }
}


const getModules = async(req, res, next)=>{
    try {
        const { courseId } = req.params;
        const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
        if (courseResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Course not found");
        }
        const course = courseResult.rows[0];
        const result = await pool.query("SELECT * FROM module WHERE course=$1", [course.id]);
        const modules = result.rows[0]
        res.status(status.OK).json({
            success: true,
            message: "Modules fetched for course",
            data: modules,
        });
    } catch (error) {
        next(error)
    }


}

const getModule = async(req, res, next)=>{
    try {
        const { courseId, moduleId } = req.params;
        const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
        if (courseResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Course not found");
        }
        const result = await pool.query("SELECT * FROM module WHERE id=$1", [moduleId]);
        if (result.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }
        const module = result.rows[0];
        res.status(status.OK).json({
            success: true,
            message: "Module details fetched",
            data: module,
        });
    } catch (error) {
        next(error)
    }
}


const updateModule = async(req, res, next)=>{
    try {
        const { courseId, moduleId } = req.params;
        const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
        if (courseResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Course not found");
        }

        const profileResult = await pool.query('SELECT * FROM instructors WHERE "user"=$1', [
            user.id,
        ]);
        if (profileResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "User profile not found");
        }

        const course = courseResult.rows[0];
        const instructorId = profileResult.rows[0].id;
        if (instructorId !== course.instructor && !user.isadmin) {
            throw new ApiError(status.FORBIDDEN, "Permission denied");
        }
        const result = await pool.query("SELECT * FROM module WHERE id=$1", [moduleId]);
        if (result.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }
        if (Object.keys(req.body).length === 0) throw new ApiError(status.BAD_REQUEST, "No fields to update for module");
        ;

        const fields = [];
        const values = [];
        let index = 1;
        for ([keys, values] in Object.entries(req.body)) {
            fields.push(`${key} = $${index}`);
            values.push(values);
            index++;
        }
        values.push(moduleId);
        const updateQuery = `UPDATE course SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
        const updateResult = await pool.query(updateQuery, values);
        return res.status(status.OK).json({
            success: true,
            data: updateResult.rows[0],
        });

    } catch (error) {
        next(error)
    }
}


const deleteModule = async(req, res, next)=>{
    try {
        const { courseId, moduleId } = req.params;
        const courseResult = await pool.query("SELECT * FROM course WHERE id=$1", [courseId]);
        if (courseResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Course not found");
        }

        const profileResult = await pool.query('SELECT * FROM instructors WHERE "user"=$1', [
            user.id,
        ]);
        if (profileResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "User profile not found");
        }

        const course = courseResult.rows[0];
        const instructorId = profileResult.rows[0].id;
        if (instructorId !== course.instructor && !user.isadmin) {
            throw new ApiError(status.FORBIDDEN, "Permission denied");
        }
        const result = await pool.query("SELECT * FROM module WHERE id=$1", [moduleId]);
        if (result.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Module not found");
        }
        await pool.query("DELETE FROM module WHERE id=$1", [moduleId]);
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
    createModule,
    getModules,
    getModule,
    deleteModule,
    updateModule
}