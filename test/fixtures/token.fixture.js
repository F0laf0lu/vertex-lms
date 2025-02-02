const JWT = require("jsonwebtoken");
const config = require("../../src/config/config");
const { instructorOne, createUser, instructorTwo, studentOne, studentTwo } = require("./user.fixture");



const generateToken = (userDetails)=>{
    const token = JWT.sign({userId: userDetails.id}, config.jwt.secret, {
        expiresIn: config.jwt.accessExpirationMinutes
    })
    return token
}

const instructorOneToken = generateToken(instructorOne)
const instructorTwoToken = generateToken(instructorTwo)
const studentTwoToken = generateToken(studentTwo)
const studentOneToken = generateToken(studentOne)


module.exports = {
    generateToken,
    instructorOneToken,
    instructorTwoToken,
    studentOneToken,
    studentTwoToken
}