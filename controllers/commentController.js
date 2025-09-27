const Comment = require("../models/Comment");
const Complaint = require("../models/Complaint");

exports.addComment = async (req, res) => {
	try {
		const { comments, userId } = req.body;
		const { id: complaintID } = req.params;

		if (!comments || !comments.trim()) {
			return res
				.status(400)
				.json({ error: "Comment message is required" });
		}

		const comment = await Comment.create({
			userID: userId,
			complaintID,
			message: comments.trim(),
		});

		await Complaint.findByIdAndUpdate(complaintID, {
			$push: { comments: comment._id },
		});

		res.status(201).json(comment);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
};

// Get all comments for a complaint
exports.getComments = async (req, res) => {
	try {
		const comments = await Comment.find({ complaintID: req.params.id })
			.populate("userID", "name avatar")
			.sort("-createdAt");

		res.status(200).json({
			status: "success",
			results: comments.length,
			data: {
				comments,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};
