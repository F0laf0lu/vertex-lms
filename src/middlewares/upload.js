const multer = require("multer");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { generateCode } = require("../utils/utils");
const path = require("path");

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 } });

const uploadCoverImage = upload.single("coverImage");

const uploadToS3 = async (file) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${generateCode(16)}${fileExtension}`;

    const params = { 
        Bucket: process.env.AWS_S3_BUCKET_NAME, 
        Key: uniqueFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params)
    await s3.send(command)
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
};

const removeFromS3 = async (fileUrl) => {
    try {
        // Extract the S3 key from the URL
        const key = fileUrl.split(".amazonaws.com/")[1];

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        console.log(`File deleted from S3: ${key}`);
    } catch (error) {
        console.error("Error deleting file from S3:", error);
    }
};

const lessonStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/mkv", "video/webm"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only MP4, MKV, and WebM are allowed."));
    }
};

const uploadLesson = multer({
    storage:lessonStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter,
});

module.exports = {
    uploadCoverImage,
    uploadToS3,
    removeFromS3,
    uploadLesson
}


