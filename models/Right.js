const mongoose = require("mongoose");

const rightObjectSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	key: { type: String, required: true, unique: true },
	description: String,
});

module.exports = mongoose.model("Right", rightObjectSchema);
