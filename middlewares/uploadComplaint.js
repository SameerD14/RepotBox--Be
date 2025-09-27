const multer = require("multer");
const path = require("path");

// Storage config for complaint images
const complaintStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/complaint/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + path.extname(file.originalname);
		cb(null, file.fieldname + "-" + uniqueSuffix);
	},
});

const uploadComplaint = multer({
	storage: complaintStorage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = uploadComplaint;
