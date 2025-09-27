const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
	{
		beforeImage: { type: String, required: true },
		afterImage: { type: String },
		beforeImage_public_id: String,
		afterImage_public_id: String,
		message: { type: String, required: true },
		afterResolvedMessage: { type: String },
		tags: [String],
		location: { type: String, required: true },
		feedback: { type: String },
		cid: { type: String, unique: true, required: true },
		type: { type: String, required: true },
		subtype: [String],
		raisedDate: { type: Date, default: Date.now },
		responseDate: { type: Date },
		resolvedDate: { type: Date },
		status: {
			type: String,
			enum: ["Raised", "Assigned", "In Progress", "Resolved"],
			default: "Raised",
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Like",
			},
		],
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Comment",
			},
		],
		likeCount: {
			type: Number,
			default: 0,
		},
		userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Complaint", complaintSchema);
