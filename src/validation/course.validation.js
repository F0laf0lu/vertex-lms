const Joi = require("joi");

const courseSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).required(),
    difficulty: Joi.string().valid("beginner", "intermediate", "advanced").required(),
    price: Joi.number().min(0).optional(),
    prerequisites: Joi.string().allow(null, "").optional(),
    iscertified: Joi.boolean().default(false),
    isavailable: Joi.boolean().default(true),
});

const updateCourseSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    difficulty: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
    price: Joi.number().min(0).optional(),
    prerequisites: Joi.string().allow(null, "").optional(),
    coverimage: Joi.string().allow(null).optional(),
    iscertified: Joi.boolean().optional(),
    isavailable: Joi.boolean().optional(),
}).min(1);

module.exports = { courseSchema, updateCourseSchema };
