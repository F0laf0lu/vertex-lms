const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const config = require("../config/config");
const { sendVerificationEmail } = require("../services/email.service");
const logger = require("../config/logger");

// TODO
// -  Validation JOI



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
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { email, firstName, lastName, password, isInstructor} = req.body;
        const getEmail = await client.query("SELECT * FROM users WHERE email=$1", [email]);
        const Email = getEmail.rows[0];
        if (Email) {
            throw new ApiError(status.BAD_REQUEST, "Email is taken");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await client.query(
            "INSERT INTO users(email, firstname, lastname, password, isinstructor) VALUES($1, $2, $3, $4, $5) RETURNING id, email, firstname,lastname, isinstructor, isverified",
            [email, firstName, lastName, 
                hashedPassword, 
                isInstructor?true:false]
        );

        const userId = user.rows[0].id;
        if (user.rows[0].isinstructor) {
            await client.query('INSERT INTO instructors("user") VALUES($1)', [userId]);
        } else {
            await client.query('INSERT INTO students("user") VALUES($1)', [userId]);
        }
        await client.query("COMMIT");
        const verifyToken = JWT.sign({ userId }, config.jwt.secret, {
            expiresIn: "1d",
        });

        try {
            await sendVerificationEmail(email, verifyToken);
        } catch (emailError) {
            logger.error(`Error sending verification email to ${email}`, emailError);
        }

        res.status(status.CREATED).json({
            success: true,
            user: user.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const getUser = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        const user = getUser.rows[0];
        if (getUser.rows.length === 0) {
            throw new ApiError(status.UNAUTHORIZED, "Invalid email or password");
        }
        const isValidPassword = bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new ApiError(status.UNAUTHORIZED, "Invalid email or password");
        }
        const userId = getUser.rows[0].id;
        const accessToken = JWT.sign({ userId }, config.jwt.secret, {
            expiresIn: config.jwt.accessExpirationMinutes,
        });
        const refreshToken = JWT.sign({ userId }, config.jwt.secret, {
            expiresIn: config.jwt.refreshExpirationDays,
        });
        res.status(status.OK).json({
            success: true,
            accessToken,
            refreshToken
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


const logout = (req, res)=>{
    const {refreshToken} = req.body
}

// resend email verification 
// change password


module.exports = {
    register,
    login,
    confirmEmail,
    createAdmin
};
