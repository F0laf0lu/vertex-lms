const Joi = require("joi");

const registerSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    // .pattern(
    //     new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
    // )
    // .message(
    //     "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character."
    // )
    isInstructor: Joi.boolean().default(false)
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
});



const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(6).required(),
});

module.exports = {
    forgotPasswordSchema,
    resetPasswordSchema,
    registerSchema,
    loginSchema,
};
