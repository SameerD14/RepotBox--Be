const PushToken = require("../models/PushToken");
const mongoose = require("mongoose");

exports.storeOrUpdateToken = async (req, res) => {
	try {
		const { userId, token } = req.body;
		if (!userId || !token) {
			return res
				.status(400)
				.json({ message: "userId and token are required" });
		}

		// Find existing token for this user
		const existing = await PushToken.findOne({ userId });

		if (existing) {
			if (existing.token === token) {
				// Same token, do nothing
				return res
					.status(200)
					.json({ message: "Token already up-to-date" });
			} else {
				// Different token, replace it
				existing.token = token;
				await existing.save();
				return res
					.status(200)
					.json({ message: "Token updated successfully" });
			}
		} else {
			// No token exists, create new
			await PushToken.create({ userId, token });
			return res
				.status(200)
				.json({ message: "Token saved successfully" });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

exports.getTokens = async (req, res) => {
	try {
		const tokens = await PushToken.find()
			.populate("userId", "name avatar phoneNo UID")
			.lean();

		// Always send a response
		res.json({ success: true, tokens });
	} catch (error) {
		console.error("Error fetching tokens:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get token by a specific user ID
exports.getTokenByUserID = async (req, res) => {
	try {
		const { userId } = req.params;
		const token = await PushToken.findOne({ userId })
			.populate({
				path: "userId",
				select: "name avatar",
			})
			.lean();
		return token;
	} catch (error) {
		console.error("Error fetching token by userId:", error);
		throw error;
	}
};

exports.deleteTokenByUserID = async (req, res) => {
	const { userId } = req.params;
	if (!userId) {
		return res
			.status(400)
			.json({ message: "userId is required to delete a token." });
	}

	try {
		const deletedToken = await PushToken.findOneAndDelete({
			userId,
		}).lean();

		if (!deletedToken) {
			return res
				.status(404)
				.json({ message: `No token found for userId: ${userId}` });
		}

		return res.status(200).json({
			message: `Deleted token for userId: ${userId}`,
			deletedToken,
		});
	} catch (error) {
		console.error(`Error deleting token for userId ${userId}:`, error);
		return res
			.status(500)
			.json({ message: "Internal server error", error: error.message });
	}
};

function getStatusMessage(complaint) {
	switch (complaint.status) {
		case "Assigned":
			return `Your complaint ${complaint.cid} has been assigned to a ${complaint.assignedTo?.name}.`;
		case "In Progress":
			return `Your complaint ${complaint.cid} is being resolved.`;
		case "Resolved":
			return `Your complaint ${complaint.cid} has been resolved by ${complaint.resolvedBy.name}`;
		case "Rejected":
			return `Your complaint ${complaint.cid} has been rejected.`;
		default:
			return `Complaint ${complaint.cid} was updated.`;
	}
}

const NOTIFICATION_TYPES = [
	"message_category",
	"email_actions",
	"customActions",
	"image",
	"complaint_update",
];

exports.parseComplaintToNotification = (complaint, tokens = []) => {
	// Ensure it's a plain object
	const plainComplaint =
		typeof complaint.toObject === "function"
			? complaint.toObject()
			: complaint;

	const sanitizedComplaint = {
		...plainComplaint,
		_id: plainComplaint._id?.toString?.(),
		url: `https://report-box.expo.app/(protected)/(tabs)/complaints/view/${plainComplaint._id?.toString?.()}`,
	};

	return tokens.map((tok) => ({
		to: tok,
		title: `Complaint Update`,
		subtitle: sanitizedComplaint.type,
		body: getStatusMessage(sanitizedComplaint),
		richContent: {
			image:
				sanitizedComplaint.status === "Resolved"
					? sanitizedComplaint.afterImage
					: sanitizedComplaint.beforeImage,
		},
		data: JSON.stringify(sanitizedComplaint),
		icon: "https://avatar.iran.liara.run/public/46",
		sound: "default",
		priority: "high",
		color: "#e31837",
		autoDismiss: true,
		categoryId: "complaint_update",
		categoryIdentifier: "complaint_update",
		attachments: [
			{
				identifier: "complaint_image",
				url:
					sanitizedComplaint.afterImage ||
					sanitizedComplaint.beforeImage,
				type: "image",
			},
		],
		interruptionLevel: "active",
	}));
};

exports.sendMultipleNotification = async (notificationContent) => {
	try {
		const response = await fetch(
			// "https://api.expo.dev/v2/push/send",
			"https://exp.host/--/api/v2/push/send",
			{
				method: "POST",
				headers: {
					Accept: "application/json",
					"Accept-encoding": "gzip, deflate",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(notificationContent),
			}
		);

		const result = await response.json();
		return result;
	} catch (error) {
		notificationError = error;
		return null;
	}
};
