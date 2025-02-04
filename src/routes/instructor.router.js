const express = require("express");
const { updateInstructorSchema } = require("../validation/instructor.validation");
const validateRequest = require("../validation/validation");
const {
    getInstructorProfile,
    updateInstructorProfile,
} = require("../controllers/instructor.controller");
const {authMiddleware} = require("../middlewares/auth");

const router = express.Router();

router.get("/:instructorId", authMiddleware, getInstructorProfile);
router.patch("/:instructorId", authMiddleware, validateRequest(updateInstructorSchema), updateInstructorProfile);

module.exports = router;
