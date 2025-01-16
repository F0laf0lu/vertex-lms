const JWT = require("jsonwebtoken");
const ApiError = require("../utils/error.util");
const { status } = require("http-status");
const config = require("../config/config");
const pool = require("../db/init");

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
            "SELECT id, email, isinstructor, isverified FROM users WHERE id=$1",
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




module.exports = authMiddleware