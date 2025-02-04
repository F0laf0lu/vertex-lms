const Joi = require("joi");

const updateInstructorschema = Joi.object({
        experience: Joi.number().integer().min(0),
        specialization: Joi.string().max(255),
        certifications: Joi.array().items(Joi.string()).default([]),
        total_courses: Joi.number().integer().min(0),
        average_rating: Joi.number().min(0).max(5).precision(2),
        website: Joi.string().uri().max(300),
    });

module.exports = { updateInstructorschema };
