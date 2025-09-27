const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
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
		userDetails: {
			name: String,
			avatar: String,
		},
	},
	{
		timestamps: true,
	}
);

likeSchema.index({ userID: 1, complaintID: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
