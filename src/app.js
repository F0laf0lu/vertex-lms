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
const authRoutes = require('./routes/auth.router')
const userRoutes = require('./routes/user.router')
const courseRouter = require('./routes/course.router')
const moduleRouter = require('./routes/module.router')
const lessonRouter = require('./routes/lesson.router')
const paymentRouter = require('./routes/payment.router')
const enrollRouter = require('./routes/enrollment.router')


const app = express();

if (config.env !== "test"){
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
app.use('/courses', courseRouter);
app.use("/:courseId/modules", moduleRouter);
app.use("/:courseId/modules/:moduleId/lessons", lessonRouter);
app.use("/pay", paymentRouter)
app.use("/enroll", enrollRouter)



// Handle unknown routes
app.use((req, res, next) => {
    next(new ApiError(status.NOT_FOUND, 'URL route not found'));
});

app.use(errorConverter);

app.use(errorHandler);

module.exports = app;