const otpGenerator = require("otp-generator");

exports.generateOtp = () => {
	return otpGenerator.generate(4, {
		digits: true,
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	});
};
exports.generateUserID = () => {
	const prefix = "USER";
	const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
	const randomNum = Math.floor(10 + Math.random() * 90);
	return `${prefix}${randomStr}${randomNum}`;
};

exports.generateComplaintID = () => {
	const prefix = "COM";
	const random = Math.floor(100000 + Math.random() * 900000);
	return `${prefix}${random}`;
};
