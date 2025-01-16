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
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')

const app = express();


if (config.env !== "test") {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());

app.options("*", cors());




const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: ["src/docs/*.yml", "src/routes/*.js"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use('/auth', authRoutes)
app.use('/users', userRoutes)

// Handle unknown routes
app.use((req, res, next) => {
    next(new ApiError(status.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);

app.use(errorHandler);

module.exports = app;