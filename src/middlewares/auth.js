const JWT = require("jsonwebtoken");
const ApiError = require("../utils/error.util");
const { status } = require("http-status");
const config = require("../config/config");
const pool = require("../db/init");
const logger = require("../config/logger");

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            throw new ApiError(status.UNAUTHORIZED, "Authorization Failed. Missing access token");
        }
        token = token.split(" ")[1];
        let payload;
        try {
            payload = JWT.verify(token, config.jwt.secret);
        } catch (error) {
            throw new ApiError(
                status.UNAUTHORIZED,
                "Authorization Failed. Invalid or expired token"
            );
        }
        if (!payload.userId) {
            throw new ApiError(status.UNAUTHORIZED, "Authorization Failed. Invalid token payload");
        }
        const result = await pool.query(
            "SELECT id, email, isinstructor, isverified, isadmin FROM users WHERE id=$1",
            [payload.userId]
        );
        if (result.rows.length === 0) {
            throw new ApiError(status.UNAUTHORIZED, "Authorization Failed. User not found");
        }
        req.user = result.rows[0]; 
        next();
    } catch (error) {
        next(error);
    }
};

const isadmin = (req, res, next)=>{
    if (!req.user.isadmin) {
        throw new ApiError(status.FORBIDDEN, "Not allowed");
    }
    next()
}

const isInstructor = (req,res, next)=>{
        if (!req.user.isinstructor) {
            throw new ApiError(status.FORBIDDEN, "You need to be an instructor");
        }
        next()
}

const isStudent = (req, res, next) => {
    if (req.user.isinstructor) {
        throw new ApiError(status.FORBIDDEN, "You need to be a Student");
    }
    next();
};

const isInstructorOrAdmin = (resourceType) => {
    return async (req, res, next) => {
        try {
            const { user } = req;
            const resourceId = req.params[`${resourceType}Id`];

            // Allow admins to proceed without further checks
            // if (user.isadmin) {
            //     console.log("Permission allowed: Admin access");
            //     return next();
            // }

            let courseId;

            if (resourceType === "module") {
                const moduleResult = await pool.query("SELECT course FROM module WHERE id=$1", [
                    resourceId,
                ]);

                if (moduleResult.rows.length === 0) {
                    throw new ApiError(status.NOT_FOUND, "Module not found");
                }
                courseId = moduleResult.rows[0].course;
            } else if (resourceType === "course") {
                const courseResult = await pool.query(
                    "SELECT id, instructor FROM course WHERE id=$1",
                    [resourceId]
                );

                if (courseResult.rows.length === 0) {
                    throw new ApiError(status.NOT_FOUND, "Course not found");
                }
                courseId = courseResult.rows[0].id;
                var courseInstructor = courseResult.rows[0].instructor;
            } else {
                throw new Error("Invalid resource type provided.");
            }

            // Fetch the instructor profile for the current user
            const profileResult = await pool.query('SELECT id FROM instructors WHERE "user"=$1', [
                user.id,
            ]); 

            if (profileResult.rows.length === 0) {
                throw new ApiError(status.FORBIDDEN, "User is not an instructor.");
            }

            const instructorId = profileResult.rows[0].id;

            // Check if user is the instructor of the course
            if (instructorId !== courseInstructor) {
                throw new ApiError(status.FORBIDDEN, "Access denied: Not the course instructor.");
            }
            console.log("Permission allowed instructor")
            next();
        } catch (error) {
            next(error);
        }
    };
};




module.exports = {
    authMiddleware,
    isInstructor,
    isStudent,
    isadmin,
    isInstructorOrAdmin
}