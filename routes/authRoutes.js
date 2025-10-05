const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");


//send otp routes 
router.post("/send-otp", authController.sendOtp);

// verify otp routes
router.post("/verify-otp", authController.verifyOtpAndLogin);

module.exports = router;
