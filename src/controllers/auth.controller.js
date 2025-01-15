const {status} = require('http-status')
const  pool = require('../db/init')
const ApiError = require('../utils/error.util')
const bcrypt = require('bcryptjs')
const JWT = require("jsonwebtoken")
const config = require('../config/config')
const { sendVerificationEmail } = require('../services/email.service')
const { use } = require('../routes/auth.routes')


const register = async(req, res, next)=>{
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const {email, firstName, lastName, password, isInstructor} = req.body
        const getEmail = await client.query("SELECT * FROM users WHERE email=$1", [email]);
        const Email = getEmail.rows[0]
        if (Email) {
            throw new ApiError(status.BAD_REQUEST, "Email is taken");
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await client.query(
            "INSERT INTO users(email, firstname, lastname, password, isinstructor) VALUES($1, $2, $3, $4, $5) RETURNING id, email, firstname,lastname, isinstructor, isverified",
            [email, firstName, lastName, hashedPassword, isInstructor]
        );

        const userId = user.rows[0].id;
        if (user.rows[0].isinstructor) {
            await client.query('INSERT INTO instructors("user") VALUES($1)', [userId]);
        } else {
            await client.query('INSERT INTO students("user") VALUES($1)', [userId]);
        }
        await client.query("COMMIT");
        const verifyToken = JWT.sign({ email }, config.jwt.secret, {
            expiresIn: "1d",
        });
        await sendVerificationEmail(user.rows[0].email, verifyToken);
        res.status(status.CREATED).json({
            success: true,
            user: user.rows[0]
        })
    } catch (error) {
        await client.query("ROLLBACK");
        next(error)
    }finally{
        client.release()
    }
}

const login = async(req, res, next)=>{
    try {
        const {email, password} = req.body
        const getUser = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        const user = getUser.rows[0];
        if (getUser.rows[0].length === 0) {
            throw new ApiError(status.BAD_REQUEST, "Incorrect email or password");
        }
        const isValidPassword = bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            throw new ApiError(status.BAD_REQUEST, "Incorrect email or password");
        }
        const token = JWT.sign({ email }, config.jwt.secret, {
            expiresIn: config.jwt.accessExpirationMinutes,
        });
        res.status(status.OK).json({
            success: true,
            accessToken: token
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    register,
    login
}