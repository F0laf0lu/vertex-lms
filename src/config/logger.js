const winston = require("winston");
const config = require("./config");


const logger = winston.createLogger({
    level: config.env === "development" ? "debug" : "info",
    format: winston.format.combine(
        config.env === "development" ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        winston.format.printf(
            ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
        )
    ),
    transports: [
        new winston.transports.Console({
            stderrLevels: ["error"],
        }),

        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        new winston.transports.File({ filename: "logs/all.log" }),
    ],
});




module.exports = logger;