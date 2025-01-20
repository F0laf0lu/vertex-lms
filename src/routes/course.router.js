const express = require("express");
const {authMiddleware, isInstructor, isInstructorOrAdmin} = require("../middlewares/auth");
const {createCourse, getAllCourses, getCourse, updateCourse, deleteCourse } = require("../controllers/course.controller")


const router = express.Router()

router.post('/', authMiddleware, isInstructor, createCourse)
router.get('/', getAllCourses)
router.get("/:courseId", getCourse);
router.patch("/:courseId", authMiddleware, isInstructorOrAdmin("course"), updateCourse);
router.delete("/:courseId", authMiddleware, deleteCourse);


module.exports = router