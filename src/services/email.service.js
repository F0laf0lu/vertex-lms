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
                "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
            )
        );
}


const sendEmail = async (to, subject, text) => {
    const msg = { from: config.email.from, to, subject, text, html };
    await transport.sendMail(msg);
};


const sendVerificationEmail = async (to, token) => {
    const subject = "Email Verification";
    // replace this url with the link to the email verification page of your front-end app
    const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
    const text = `Dear user,
        To verify your email, click on this link: ${verificationEmailUrl}
        If you did not create an account, then ignore this email.`;
    const html = emailVerifyTemplate(
        config.app.appName,
        config.app.appURL,
        text
    )
    await sendEmail(to, subject, text, html);
};

module.exports = {
    sendVerificationEmail
}