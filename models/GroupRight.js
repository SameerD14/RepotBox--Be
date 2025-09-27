const mongoose = require("mongoose");

const groupRightSchema = new mongoose.Schema({
	groupId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Group",
		required: true,
	},
	rightId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Right",
		required: true,
	},
});

module.exports = mongoose.model("GroupRight", groupRightSchema);
