const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const morgan = require("./config/morgan");
const ApiError = require("./utils/error.util");
const { errorHandler, errorConverter } = require("./middlewares/error");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDefinition = require("./docs/swaggerSetup");
const { status } = require("http-status");

const app = express();


// if (config.env !== "test") {
//     app.use(morgan.successHandler);
//     app.use(morgan.errorHandler);
// }


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());

app.options("*", cors());


// Route to test error handling

// app.get("/", function (req, res, next) {
//     try {
//         // throw new ApiError(404, "Resource not found", false);
//         throw new Error("Resource not found")
//     } catch (error) {
//         next(error);
//     } 
// });


const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: ["src/docs/*.yml", "src/routes/*.js"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));


// Handle unknown routes
app.use((req, res, next) => {
    next(new ApiError(status.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);

app.use(errorHandler);

module.exports = app;