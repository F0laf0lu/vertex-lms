const JWT = require("jsonwebtoken");
const config = require("../../src/config/config");



const generateToken = (userDetails)=>{
    const token = JWT.sign({userId: userDetails.id}, config.jwt.secret, {
        expiresIn: config.jwt.accessExpirationMinutes
    })
    return token
}

module.exports = generateToken