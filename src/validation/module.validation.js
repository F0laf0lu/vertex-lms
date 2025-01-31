const Joi = require("joi");

// Validation schema for creating a module
const createModuleSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required",}),
    description: Joi.string().allow("").optional(),
});

const updateModuleSchema = Joi.object({
    name: Joi.string().optional().messages({"string.empty": "Name cannot be empty",}),
    description: Joi.string().allow("").optional(), 
}).min(1);

module.exports = {
    createModuleSchema,
    updateModuleSchema,
};
