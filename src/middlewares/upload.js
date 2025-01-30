const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { generateCode } = require("../utils/utils");


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
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, //
        // Key: `course-covers/${Date.now()}_${path.basename(file.originalname)}`, // 
        Key: generateCode(16),
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params)

    await s3.send(command)

    // Upload to S3
    // const result = await s3.upload(params).promise();
    // return result.Location; // Return the file URL
    return params.Key
};

module.exports = {
    uploadCoverImage,
    uploadToS3
}