const express = require("express");
const { authMiddleware, isStudent, isInstructorOrAdmin } = require("../middlewares/auth");
const {
    enrollStudent
} = require("../controllers/enrollment.controller");


const router = express.Router();

router.post("/", authMiddleware, isStudent, enrollStudent);

module.exports = router;
