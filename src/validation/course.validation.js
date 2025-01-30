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

const validateCourse = (courseData) => {
    return courseSchema.validate(courseData, { abortEarly: false });
};

module.exports = { validateCourse, courseSchema };
