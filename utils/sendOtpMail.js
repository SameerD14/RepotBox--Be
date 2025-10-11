// utils/sendOtpMail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
       user: "y8221733@gmail.com",
		pass: "ajto nkzy opgd ivfg",
	},
});

exports.sendOtpMail = async (email, otp) => {
	const mailOptions = {
		from: "y8221733@gmail.com",
		to: email,
		subject: "Your OTP for Login",
		text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
	};

	return transporter.sendMail(mailOptions);
};
