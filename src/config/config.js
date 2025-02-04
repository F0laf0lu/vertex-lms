const dotenv = require("dotenv");
dotenv.config()

const isTestEnv = process.env.NODE_ENV === "test";



module.exports = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT,
    db: {
        PORT: parseInt(isTestEnv ? process.env.TEST_DB_PORT : process.env.DB_PORT, 10),
        NAME: isTestEnv ? process.env.TEST_DB_NAME : process.env.DB_NAME,
        HOST: isTestEnv ? process.env.TEST_DB_HOST : process.env.DB_HOST,
        PASSWORD: isTestEnv ? process.env.TEST_DB_PASSWORD : process.env.DB_PASSWORD,
        USER: isTestEnv ? process.env.TEST_DB_USER : process.env.DB_USER,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'my-secret-key',
        accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || '10m',
        refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || '15d',
    },
    email: {
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        },
        from: process.env.EMAIL_FROM,
    },
    app:{
        appName: process.env.APP_NAME,
        appURL: process.env.APP_URL
    }
};