const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/user/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + path.extname(file.originalname);
		cb(null, file.fieldname + "-" + uniqueSuffix);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

module.exports = upload;
