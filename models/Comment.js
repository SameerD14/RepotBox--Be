const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
	{
		userID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		complaintID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Complaint",
			required: true,
		},
		message: {
			type: String,
			required: true,
			maxlength: 500,
		},
		userDetails: {
			name: String,
			avatar: String,
		},
	},
	{
		timestamps: true,
	}
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
