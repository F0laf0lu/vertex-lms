const { status } = require("http-status");
const pool = require("../db/init");



const getAllStudentProfile = async(req , res, next)=>{
    // Admin only 
    try {
        res.status(status.OK).json({
            success:true
        })
    } catch (error) {
        next(error)
    }
}

const getAllInstructorProfile = async (req, res, next) => {
    // Admin only
    try {
        res.status(status.OK).json({
            success: true,
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