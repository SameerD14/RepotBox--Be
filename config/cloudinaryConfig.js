const cloudinary = require("cloudinary").v2;
require("dotenv").config({ quiet: true });

cloudinary.config({
	cloud_name: "",
	api_key: "",
	api_secret: "",
});

module.exports = cloudinary;
