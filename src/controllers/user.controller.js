const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");


const getAllUsers = async (req, res, next) => {
    // Admin only endpoint
    try {
        const result = await pool.query('SELECT * FROM users')
        const users = result.rows
        res.status(status.OK).json({
            success: true,
            data:{
                users
            }
        });
    } catch (error) {
        next(error);
    }
};


const manageUser = async (req, res, next) => {
    // Admin only endpoint
    try {
        const {userId} = req.params
        const result = await pool.query("SELECT id, email, firstname, lastname, isinstructor, isverified FROM users WHERE id=$1",[userId]);
        if (result.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "User not found");
        }
        if (req.method === 'GET') {
            const user = result.rows[0];
            return res.status(status.OK).json({
                success: true,
                data: {
                    user,
                },
            });
        }

        throw new ApiError(status.METHOD_NOT_ALLOWED, "Invalid request method");
    } catch (error) {
        next(error);
    }
};





const getAllStudentProfile = async(req , res, next)=>{
    // Admin only 
    try {
        const result = await pool.query("SELECT * FROM students");
        const students = result.rows;
        res.status(status.OK).json({
            success: true,
            data: {
                students,
            },
        });
    } catch (error) {
        next(error);
    }
}

const getAllInstructorProfile = async (req, res, next) => {
    // Admin only
    try {
        const result = await pool.query("SELECT * FROM instructors");
        const instructors = result.rows;
        res.status(status.OK).json({
            success: true,
            data: {
                instructors,
            },
        });
    } catch (error) {
        next(error);
    }
};


const getUserProfile = async (req, res, next) => {
    // Admin or user
    try {
        // get user from users table
        // use the isinstructor to get either student or instructor profile
        res.status(status.OK).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};


const updateProfile = async (req, res, next) => {
    try {
        res.status(status.OK).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};



module.exports = {
    getAllUsers,
    manageUser,
    getAllStudentProfile,
    getAllInstructorProfile,
};