const instructorService = require("../services/instructor.service");
const { validateInstructorUpdate } = require("../validation/instructor.validation");

const getInstructorProfile = async (req, res, next) => {
    try {
        const { id } = req.user; 
        const instructor = await instructorService.getProfile(id);
        res.status(200).json({ success: true, data: instructor });
    } catch (error) {
        next(error);
    }
};

const updateInstructorProfile = async (req, res, next) => {
    try {
        const { id } = req.user;

        const updatedProfile = await instructorService.updateProfile(id, req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getInstructorProfile, updateInstructorProfile };
