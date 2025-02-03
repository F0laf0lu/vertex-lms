const express = require("express");
const {authMiddleware, isInstructor, isCourseInstructor} = require("../middlewares/auth");
const {uploadLesson} = require("../middlewares/upload");
const lessonController = require("../controllers/lesson.controller");
const validateRequest = require("../validation/validation");
const { createLessonSchema, updateLessonSchema } = require("../validation/lesson.validation");
const router = express.Router({ mergeParams: true });


router.get("/", lessonController.getLessons);

router.post("/", 
    authMiddleware, 
    isCourseInstructor("course"), 
    validateRequest(createLessonSchema),
    uploadLesson.single("lessonvideo"), 
    lessonController.createLesson
);

router.get("/:lessonId", lessonController.getLesson);

router.patch("/:lessonId", 
    authMiddleware, 
    isCourseInstructor("course"),
    validateRequest(updateLessonSchema),
    lessonController.updateLesson);


router.delete("/:lessonId", authMiddleware, isCourseInstructor("course"), lessonController.deleteLesson);



module.exports = router;