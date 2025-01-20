const express = require("express");
const { authMiddleware, isInstructorOrAdmin} = require("../middlewares/auth");
const {createModule, getModules, getModule, updateModule, deleteModule } = require("../controllers/module.controller");

const router = express.Router({mergeParams:true});




router.get('/', getModules)
router.post("/", authMiddleware, isInstructorOrAdmin("course"), createModule);
router.get("/:moduleId", authMiddleware, isInstructorOrAdmin("course"), getModule);
router.patch("/:moduleId", authMiddleware, isInstructorOrAdmin("course"), updateModule);
router.delete("/:moduleId", authMiddleware, isInstructorOrAdmin("course"), deleteModule);





module.exports = router