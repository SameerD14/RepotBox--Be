const cloudinary = require("cloudinary").v2;
require("dotenv").config({ quiet: true });

cloudinary.config({   
	cloud_name: "dv6kpjafa", 
	api_key: "899745167288953",   
	api_secret: "W2nhNndF3u9ZZQsqfJI2tFEn24M",
}); 


module.exports = cloudinary; // CLOUDINARY_URL=cloudinary://899745167288953:W2nhNndF3u9ZZQsqfJI2tFEn24M@dv6kpjafa
