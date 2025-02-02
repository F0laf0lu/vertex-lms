const crypto = require('crypto')


const generateCode = (length = 32, numeric = false) => {
    if (!numeric) {
        return crypto.randomBytes(length).toString("hex");
    }
    length = 6;
    const randomBytes = crypto.randomBytes(length);
    const randomNumber = parseInt(randomBytes.toString("hex"), 16);
    const code = randomNumber.toString().slice(0, length);
    return code.padStart(length, "0");
};

const estimateReadingTime = (text) => {
    const wordsPerMinute = 200; 
    const words = text.split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60); 
};



module.exports = {
    generateCode,
    estimateReadingTime
}