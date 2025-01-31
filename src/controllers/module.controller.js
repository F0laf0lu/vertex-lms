const { status } = require("http-status");
const moduleService = require("../services/module.service");


const createModule = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { name, description } = req.body;

        await moduleService.checkCourseExists(courseId);
        const newModule = await moduleService.createModule(courseId, { name, description });

        return res.status(status.CREATED).json({
            success: true,
            data: newModule,
        });
    } catch (error) {
        next(error);
    }
};

const getModules = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        await moduleService.checkCourseExists(courseId);
        const modules = await moduleService.getModulesByCourse(courseId);

        res.status(status.OK).json({
            success: true,
            message: "Modules fetched for course",
            data: modules,
        });
    } catch (error) {
        next(error);
    }
};


const getModule = async (req, res, next) => {
    try {
        const { moduleId } = req.params;
        const module = await moduleService.getModuleById(moduleId);
        res.status(status.OK).json({
            success: true,
            message: "Module details fetched",
            data: module,
        });
    } catch (error) {
        next(error);
    }
};

const updateModule = async (req, res, next) => {
    try {
        const { moduleId } = req.params;
        const updateFields = req.body;

        const updatedModule = await moduleService.updateModuleById(moduleId, updateFields);

        return res.status(status.OK).json({
            success: true,
            data: updatedModule,
        });
    } catch (error) {
        next(error);
    }
};


const deleteModule = async (req, res, next) => {
    try {
        const { moduleId } = req.params;
        await moduleService.deleteModuleById(moduleId);

        return res.status(status.NO_CONTENT).json({
            success: true,
            message: "Module deleted successfully",
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createModule,
    getModules,
    getModule,
    deleteModule,
    updateModule
}