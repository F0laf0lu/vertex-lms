const { status } = require("http-status");
const logger = require("../config/logger");
const config = require("../config/config");
const ApiError = require("../utils/error.util");

const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || status.INTERNAL_SERVER_ERROR;
        const message = error.message || status[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};


const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (config.env === "production" && !err.isOperational) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = status[status.INTERNAL_SERVER_ERROR];
    }

    res.locals.errorMessage = err.message;

    
    if (config.env === "development") {
        logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });
    }

    res.status(statusCode).json({
        statusCode,
        message,
        ...(config.env === "development" && { stack: err.stack }),
    });
};


module.exports = {
    errorConverter,
    errorHandler,
};
