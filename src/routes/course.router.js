const express = require("express");
const {authMiddleware, isInstructor, isCourseInstructor} = require("../middlewares/auth");
const {createCourse, getAllCourses, getCourse, updateCourse, deleteCourse } = require("../controllers/course.controller");
const { uploadCoverImage } = require("../middlewares/upload");
const { courseSchema, updateCourseSchema } = require("../validation/course.validation");
const validateRequest = require("../validation/validation");






const router = express.Router()

router.post("/", 
    authMiddleware, 
    isInstructor, 
    uploadCoverImage, 
    validateRequest(courseSchema), 
    createCourse);

router.get('/', getAllCourses);

router.get("/:courseId", getCourse);

router.patch("/:courseId", 
            authMiddleware, 
            isCourseInstructor("course"),
            validateRequest(updateCourseSchema),
            updateCourse
        );


router.delete("/:courseId", 
    authMiddleware, 
    isCourseInstructor("course"), 
    deleteCourse);


module.exports = router