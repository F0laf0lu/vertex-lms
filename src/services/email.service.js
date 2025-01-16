const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");
const { emailVerifyTemplate } = require("../template/auth.template");



const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== "test") {
    transport
        .verify()
        .then(() => logger.info("Connected to email server"))
        .catch(() =>
            logger.warn(
                "Unable to connect to email server. Make sure you have configured the SMTP options in .env or check your internet connection"
            )
        );
}


const sendEmail = async (to, subject, text, html) => {
    const msg = { 
        from: config.email.from, 
        to, 
        subject, 
        text, 
        html 
    };
    await transport.sendMail(msg);
};


const sendVerificationEmail = async (to, token) => {
    const subject = "Email Verification";
    const verificationEmailUrl = `http://vertexlearn.com/verify-email?token=${token}`;
    const text = `Dear user, To verify your email, click on this link: ${verificationEmailUrl}
        If you did not create an account, then ignore this email.`;
    const html = emailVerifyTemplate(
        config.app.appName,
        config.app.appURL,
        verificationEmailUrl
    )
    await sendEmail(to, subject, text, html);
};

module.exports = {
    sendVerificationEmail
}