const mongoose = require("mongoose");

const localString = "mongodb://127.0.0.1:27017/reportbox";
const connectDB = async () => {
	try {
		const connectionString = localString;
		await mongoose.connect(connectionString, {});
		console.log("MongoDB connected to :", connectionString);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

module.exports = connectDB;
