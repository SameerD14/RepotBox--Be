const Like = require("../models/Like");
const Complaint = require("../models/Complaint");

exports.toggleLike = async (req, res) => {
	try {
		const { id: complaintID } = req.params;
		const userID = req.body.userId; // from request body

		const existingLike = await Like.findOne({ userID, complaintID });

		if (existingLike) {
			await Like.findByIdAndDelete(existingLike._id);
			await Complaint.findByIdAndUpdate(complaintID, {
				$pull: { likes: existingLike._id },
				$inc: { likeCount: -1 },
			});
			return res.json({ liked: false });
		} else {
			const like = await Like.create({
				userID,
				complaintID,
			});
			await Complaint.findByIdAndUpdate(complaintID, {
				$push: { likes: like._id },
				$inc: { likeCount: 1 },
			});
			return res.json({ liked: true });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
};

// Check if user liked a complaint
exports.checkUserLike = async (req, res) => {
	try {
		const like = await Like.findOne({
			userID: req.user._id,
			complaintID: req.params.id,
		});

		res.status(200).json({
			status: "success",
			data: {
				liked: !!like,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};
