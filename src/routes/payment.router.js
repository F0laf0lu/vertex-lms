const express = require("express");
const { authMiddleware, isStudent } = require("../middlewares/auth");
const { makePayment, paystackWebhook} = require("../controllers/payment.controller");

const router = express.Router();

router.post("/checkout", authMiddleware, isStudent, makePayment);
router.post("/paystack/webhook", paystackWebhook);

module.exports = router;
