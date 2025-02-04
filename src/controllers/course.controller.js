const {status} = require("http-status")

const {createCourseService, 
        getAllCoursesService,
        getCourseService, 
        updateCourseService, 
        deleteCourseService} = require("../services/course.service")

const {uploadToS3, removeFromS3}  = require("../middlewares/upload");

const createCourse = async (req, res, next) => {
    try {       
        if (req.file) {
            const coverImage = await uploadToS3(req.file)
            req.body.coverImage = coverImage
        }
        const newCourse = await createCourseService(req.user.id, req.body)
        return res.status(status.CREATED).json({
            success: true,
            data: newCourse,
        });
    } catch (error) {
        next(error);
    }
};


const getAllCourses = async(req, res, next)=>{
    try {
        const courses = await getAllCoursesService();
        res.status(status.OK).json({
            success: true,
            message: "All courses fetched successfully",
            data: courses
        })
    } catch (error) {
        next(error)
    }
}

const getCourse = async(req, res, next)=>{
    try {
        const { courseId } = req.params;
        const course = await getCourseService(courseId);
        res.status(status.OK).json({
            success:true,
            message: "Course details fetched",
            data: course
        })
    } catch (error) {
        next(error)
    }
}

const updateCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        if (req.file) {
            const coverImage = await uploadToS3(req.file);
            req.body.coverImage = coverImage;
        }
        const updatedCourse = await updateCourseService(courseId, req.body);
        res.status(status.OK).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        });
    } catch (error) {
        next(error);
    }
};

// const updateCourse1 = async(req, res, next)=>{
//     try {
//         const { courseId } = req.params;
//         const fields = [];
//         const data = [];
//         Object.entries(req.body).map((entry, index) => {
//             fields.push(`${entry[0]}=$${index + 1}`);
//             data.push(entry[1]);
//         });
//         if (fields.length === 0) {
//             throw new ApiError(status.BAD_REQUEST, "No fields to update");
//         } 
//         data.push(courseId);
//         const updateQuery = `UPDATE course SET ${fields.join(", ")} WHERE id = $${fields.length + 1} RETURNING *`;
//         const updateResult = await pool.query(updateQuery, data)
//         return res.status(status.OK).json({
//             success: true,
//             data: updateResult.rows[0],
//         });
//     } catch (error) {
//         next(error)
//     }
// }

const deleteCourse = async(req, res, next)=>{
    try {
        const { courseId } = req.params;
        const response = await deleteCourseService(courseId);
        return res.status(status.NO_CONTENT).json({
            success: true,
            message: response.message,
            data: {}
        });
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createCourse,
    getAllCourses,
    getCourse,
    updateCourse,
    deleteCourse
};
