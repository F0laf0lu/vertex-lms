const Joi = require("joi");
const ApiError = require("../utils/error.util");
const { status } = require("http-status");
const multer = require("multer");



const validateRequest = (schema) => {
    return [ upload.none(),
        (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorMessages = error.details.map((err) => err.message);
            throw new ApiError(status.BAD_REQUEST, errorMessages.join(", "));
        }
        req.body = value; 
        next();
    }
    ]
};

module.exports = validateRequest;