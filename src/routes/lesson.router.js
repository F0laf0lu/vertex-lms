const express = require("express");
const {authMiddleware, isInstructor, isCourseInstructor} = require("../middlewares/auth");
const {createLesson, getLessons, getLesson, updateLesson, deleteLesson } = require("../controllers/lesson.controller")

const router = express.Router({ mergeParams: true });


router.get("/", getLessons);
router.post("/", authMiddleware, isCourseInstructor("course"), createLesson);
router.get("/:lessonId", getLesson);
router.patch("/:lessonId", authMiddleware, isCourseInstructor("course"), updateLesson);
router.delete("/:lessonId", authMiddleware, isCourseInstructor("course"), deleteLesson);



module.exports = router;