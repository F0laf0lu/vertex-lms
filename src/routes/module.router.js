const express = require("express");
const {authMiddleware, isInstructor, isOwner} = require("../middlewares/auth");
const {createModule, getModules, getModule, updateModule, deleteModule } = require("../controllers/module.controller");

const router = express.Router({mergeParams:true});




router.get('/', getModules)
router.post("/", authMiddleware, createModule);
router.get('/:moduleId', getModule)
router.patch('/:moduleId', authMiddleware, updateModule)
router.delete('/:moduleId', authMiddleware, deleteModule)





module.exports = router