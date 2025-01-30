const express = require("express");
const { authMiddleware, isCourseInstructor} = require("../middlewares/auth");
const {createModule, getModules, getModule, updateModule, deleteModule } = require("../controllers/module.controller");

const router = express.Router({mergeParams:true});




router.get('/', getModules)
router.post("/", authMiddleware, isCourseInstructor("course"), createModule);
router.get("/:moduleId", authMiddleware, isCourseInstructor("course"), getModule);
router.patch("/:moduleId", authMiddleware, isCourseInstructor("course"), updateModule);
router.delete("/:moduleId", authMiddleware, isCourseInstructor("course"), deleteModule);





module.exports = router