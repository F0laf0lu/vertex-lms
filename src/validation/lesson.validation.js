const Joi = require("joi");

// Schema for creating a lesson
const createLessonSchema = Joi.object({
    name: Joi.string().max(200).required(),
    lessontext: Joi.string().allow(null, ""), 
    duration: Joi.number().integer().positive().allow(null)
});

// Schema for updating a lesson (partial updates allowed)
const updateLessonSchema = Joi.object({
    name: Joi.string().max(200),
    lessontext: Joi.string().allow(null, ""),
    duration: Joi.number().integer().positive().allow(null),
    order: Joi.number().integer().positive(), 
}).min(1); // Ensure at least one field is provided

module.exports = {
    createLessonSchema,
    updateLessonSchema,
};
