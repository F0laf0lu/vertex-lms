const express = require("express");
const {authMiddleware, isInstructor, isOwner} = require("../middlewares/auth");
const {createCourse, getAllCourses, getCourse, updateCourse, deleteCourse } = require("../controllers/course.controller")


const router = express.Router()

router.post('/', authMiddleware, isInstructor, createCourse)
router.get('/', getAllCourses)
router.get('/:id', getCourse)
router.patch('/:id', updateCourse)
router.patch('/:id', deleteCourse)


module.exports = router