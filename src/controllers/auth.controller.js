const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const config = require("../config/config");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email.service");
const logger = require("../config/logger");
const { registerService, loginService } = require("../services/auth.service");



const createAdmin = async(req, res, next)=>{
    try {
        const { email, firstName, lastName, password } = req.body;

        const getEmail = await client.query("SELECT * FROM users WHERE email=$1", [email]);
        const Email = getEmail.rows[0];
        if (Email) {
            throw new ApiError(status.BAD_REQUEST, "Email is taken");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await client.query(
            "INSERT INTO users(email, firstname, lastname, password, isadmin) VALUES($1, $2, $3, $4, $5) RETURNING id, email, firstname, lastname, isinstructor, isverified",
            [email, firstName, lastName, hashedPassword, true]
        );
        res.status(status.CREATED).json({
            success: true,
            user: user.rows[0],
        });
    } catch (error) {
        next(error)
    }
}


const register = async (req, res, next) => {
    try {
        const newUser = req.body;
        const user = await registerService(newUser);
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const user = req.body;
        const result = await loginService(user);
        res.status(status.OK).json({
            success: true,
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
    } catch (error) {
        next(error);
    }
};

const confirmEmail = async (req, res, next) => {
    const { token } = req.body;
    try {
        const payload = JWT.verify(token, config.jwt.secret);
        const { userId } = payload;
        const verifyUser = await pool.query(
            "UPDATE USERS SET isverified=true WHERE id=$1 RETURNING id, email, isverified",
            [userId]
        );
        if (verifyUser.rowCount === 0) {
            throw new ApiError(status.BAD_REQUEST, "User not found or already verified.");
        }
        res.status(status.OK).json({ success: true, message: "Email verified successfully."});
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const userResult = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
        if (userResult.rows.length === 0) {
            throw new ApiError(status.NOT_FOUND, "User not found");
        }
        const userId = userResult.rows[0].id;
        // Generate JWT reset token (expires in 15 minutes)
        const resetToken = JWT.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
        // Send reset link via email
        sendPasswordResetEmail(email, resetToken)
        res.status(status.OK).json({
            success: true,
            message: "Password reset link sent successfully.",
        });
    } catch (error) {
        next(error);
    }
};


const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        let decoded;
        try {
            decoded = JWT.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new ApiError(status.UNAUTHORIZED, "Invalid or expired token");
        }
        const userId = decoded.userId;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashedPassword, userId]);
        res.status(status.OK).json({
            success: true,
            message: "Password reset successfully. You can now log in.",
        });
    } catch (error) {
        next(error);
    }
};




module.exports = {
    register,
    login,
    confirmEmail,
    createAdmin,
    resetPassword,
    forgotPassword
};
