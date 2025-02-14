const { status } = require("http-status");
const pool = require("../db/init");
const ApiError = require("../utils/error.util");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const config = require("../config/config");
const { sendVerificationEmail } = require("../services/email.service");
const logger = require("../config/logger");


const registerService = async ({ email, firstName, lastName, password, isinstructor }) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = `
            INSERT INTO users (email, firstname, lastname, password, isinstructor) 
            VALUES ($1, $2, $3, $4, $5) 
            ON CONFLICT (email) DO NOTHING 
            RETURNING id, email, firstname, lastname, isinstructor, isverified
        `;

        const { rows } = await client.query(insertUserQuery, [
            email,
            firstName,
            lastName,
            hashedPassword,
            Boolean(isinstructor),
        ]);

        if (rows.length === 0) {
            throw new ApiError(400, "Email is taken");
        }

        const user = rows[0];

        // Batch insert to the appropriate table
        const insertRoleQuery = isinstructor
            ? `INSERT INTO instructors ("user") VALUES ($1)`
            : `INSERT INTO students ("user") VALUES ($1)`;
        await client.query(insertRoleQuery, [user.id]);

        await client.query("COMMIT");

        // Generate verification token
        const verifyToken = JWT.sign({ userId: user.id }, config.jwt.secret, { expiresIn: "1d" });
        await sendVerificationEmail(email, verifyToken);

        return user;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


const loginService = async ({email, password}) => {
        const getUser = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        const user = getUser.rows[0];
        if (getUser.rows.length === 0) {
            throw new ApiError(status.UNAUTHORIZED, "Invalid email or password");
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
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
        
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstname,
                lastName: user.lastname,
            },
            accessToken,
            refreshToken,
        };
};


module.exports = {
    registerService,
    loginService
}