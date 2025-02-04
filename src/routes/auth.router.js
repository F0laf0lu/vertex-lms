const express = require('express')
const {
    register,
    login,
    confirmEmail,
    createAdmin,
    forgotPassword,
    resetPassword,
    requestVerificationEmail
} = require("../controllers/auth.controller");
const validateRequest = require("../validation/validation");
const {
    forgotPasswordSchema,
    resetPasswordSchema,
    registerSchema,
    loginSchema,
} = require("../validation/auth.validation");
const {authMiddleware} = require("../middlewares/auth");


const router = express.Router()

router.get('/admin', createAdmin)
router.post("/register", validateRequest(registerSchema), register); 
router.post("/login", validateRequest(loginSchema), login);
router.post('/verify-email', confirmEmail)
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);
router.post("/resend-verification", authMiddleware, requestVerificationEmail);




module.exports = router;


