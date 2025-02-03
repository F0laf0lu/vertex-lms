const express = require('express')
const {
    register,
    login,
    confirmEmail,
    createAdmin,
    forgotPassword,
    resetPassword,
} = require("../controllers/auth.controller");
const validateRequest = require("../validation/validation");
const {
    forgotPasswordSchema,
    resetPasswordSchema,
    registerSchema,
    loginSchema,
} = require("../validation/auth.validation");



const router = express.Router()

router.get('/admin', createAdmin)
router.post("/register", validateRequest(registerSchema), register); 
router.post("/login", validateRequest(loginSchema), login);
router.post('/verify-email', confirmEmail)
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validateRequest(resetPasswordSchema), resetPassword);




module.exports = router;


