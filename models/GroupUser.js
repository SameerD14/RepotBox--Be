const mongoose = require("mongoose");

const groupUserSchema = new mongoose.Schema({
	groupId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Group",
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

module.exports = mongoose.model("GroupUser", groupUserSchema);
