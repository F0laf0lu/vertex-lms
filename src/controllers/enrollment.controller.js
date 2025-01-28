const {enrollService} = require("../services/enrollment.service");

const enrollStudent = async (req, res, next) => {
    const { courseId } = req.body;
    const {id} = req.user
    if (!courseId) {
        return res.status(400).json({ message: "Course ID is required." });
    }
    try {
        const enrollment = await enrollService(id, courseId);
        res.status(201).json({ message: "Enrollment successful", enrollment });
    } catch (error) {
        next(error)
    }
};

module.exports = { enrollStudent };
