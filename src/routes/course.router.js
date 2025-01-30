const express = require("express");
const {authMiddleware, isInstructor, isCourseInstructor} = require("../middlewares/auth");
const {createCourse, getAllCourses, getCourse, updateCourse, deleteCourse } = require("../controllers/course.controller");
const { uploadCoverImage } = require("../middlewares/upload");
const { validateCourse, courseSchema } = require("../validation/course.validation");
const validateRequest = require("../validation/validation");






const router = express.Router()

router.post("/", authMiddleware, isInstructor, uploadCoverImage, createCourse);
router.get('/', getAllCourses);
router.get("/:courseId", getCourse);
router.patch("/:courseId", authMiddleware, isCourseInstructor("course"), updateCourse);
router.delete("/:courseId", authMiddleware, deleteCourse);


module.exports = router