const express = require("express");
const {authMiddleware, isInstructor, isInstructorOrAdmin} = require("../middlewares/auth");
const {createLesson, getLessons, getLesson, updateLesson, deleteLesson } = require("../controllers/lesson.controller")

const router = express.Router({ mergeParams: true });


router.get("/", getLessons);
router.post("/", authMiddleware, isInstructorOrAdmin("course"), createLesson);
router.get("/:lessonId", getLesson);
router.patch("/:lessonId", authMiddleware, isInstructorOrAdmin("course"), updateLesson);
router.delete("/:lessonId", authMiddleware, isInstructorOrAdmin("course"), deleteLesson);



module.exports = router;