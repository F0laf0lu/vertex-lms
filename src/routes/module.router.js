const express = require("express");
const { authMiddleware, isCourseInstructor} = require("../middlewares/auth");
const {createModule, getModules, getModule, updateModule, deleteModule } = require("../controllers/module.controller");
const moduleController = require("../controllers/module.controller");
const { createModuleSchema, updateModuleSchema } = require("../validation/module.validation");
const validateRequest = require("../validation/validation");


const router = express.Router({mergeParams:true});




router.get('/', getModules)

router.post("/", 
    authMiddleware, 
    isCourseInstructor("course"), 
    validateRequest(createModuleSchema), 
    moduleController.createModule);

router.get("/:moduleId", 
    authMiddleware, 
    isCourseInstructor("course"), 
    moduleController.getModule
);

router.patch(
    "/:moduleId",
    authMiddleware,
    isCourseInstructor("course"),
    validateRequest(updateModuleSchema),
    moduleController.updateModule
);

router.delete(
    "/:moduleId",
    authMiddleware,
    isCourseInstructor("course"),
    moduleController.deleteModule
);





module.exports = router