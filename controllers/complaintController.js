const Complaint = require("../models/Complaint");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const PushToken = require("../models/PushToken");
const { generateComplaintID } = require("../utils/generateOtp");
const cloudinary = require("../config/cloudinaryConfig");
const {
	parseComplaintToNotification,
	sendMultipleNotification,
} = require("./pushTokenController");

exports.createComplaint = async (req, res) => {
	try {
		const cid = generateComplaintID();
		const newComplaint = await Complaint.create({
			...req.body,
			cid,
			status: "Raised",
			raisedDate: new Date(),
		});

		res.status(201).json(newComplaint);
	} catch (err) {
		console.error("Create Complaint Error:", err);
		res.status(400).json({ error: err.message });
	}
};

exports.getComplaintByUserID = async (req, res) => {
	try {
		const complaints = await Complaint.find({ userID: req.params.id })
			.populate("userID", "name avatar")
			.populate("assignedTo", "name phoneNo avatar")
			.populate("resolvedBy", "name phoneNo avatar")
			.populate("assignedBy", "name phoneNo avatar")
			.populate("comments")
			.populate("likes")
			.sort("-createdAt");

		res.status(200).json({
			status: "success",
			results: complaints.length,
			data: {
				complaints: complaints || [],
			},
		});
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: err.message,
		});
	}
};

exports.updateComplaintByID = async (req, res) => {
	try {
		const { id } = req.params;

		// Fetch old complaint to compare status
		const oldComplaint = await Complaint.findById(id).select(
			"status userID"
		);
		if (!oldComplaint) {
			return res.status(404).json({ error: "Complaint not found" });
		}

		// Prepare update data
		const updateData = { ...req.body };

		// Remove invalid ObjectId fields if empty
		const objectIdFields = ["assignedBy", "assignedTo", "resolvedBy"];
		objectIdFields.forEach((field) => {
			if (!updateData[field]) delete updateData[field];
		});

		// Find and update complaint
		const complaint = await Complaint.findByIdAndUpdate(id, updateData, {
			new: true,
		})
			.populate("userID", "name avatar")
			.populate("assignedBy", "name avatar")
			.populate("assignedTo", "name avatar")
			.populate("resolvedBy", "name avatar");

		if (!complaint) {
			return res.status(404).json({ error: "Complaint not found" });
		}

		// Send notification only if status is updated
		if (updateData.status && updateData.status !== oldComplaint.status) {
			const tokens = (
				await PushToken.find({ userId: complaint.userID._id })
			).map((t) => t.token);

			if (tokens.length > 0) {
				const notificationContent = parseComplaintToNotification(
					complaint,
					tokens
				);
				await sendMultipleNotification(notificationContent);
			}
		}

		res.status(200).json(complaint);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};
const deleteImage = async (public_id) => {
	if (public_id) {
		try {
			const result = await cloudinary.uploader.destroy(public_id);
			// Optional: Log failure if image not found
			if (result.result !== "ok") {
				console.log(`Image ${public_id} not found or already deleted`);
			}
		} catch (err) {
			console.log(`Failed to delete image ${public_id}:`, err.message);
		}
	}
};
exports.deleteComplaintByID = async (req, res) => {
	try {
		const complaintId = req.params.id;

		// Find the complaint first
		const complaint = await Complaint.findById(complaintId);
		if (!complaint) {
			return res.status(404).json({ error: "Complaint not found" });
		}

		await Promise.all([
			deleteImage(complaint.beforeImage_public_id),
			deleteImage(complaint.afterImage_public_id),
		]);

		// Delete complaint and related data in parallel
		await Promise.all([
			Complaint.findByIdAndDelete(complaintId),
			Comment.deleteMany({ complaintId }),
			Like.deleteMany({ complaintId }),
		]);

		res.status(200).json({
			message: "Complaint, images, and related data deleted",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
};
exports.deleteComplaintByID1 = async (req, res) => {
	try {
		const complaintId = req.params.id;

		// Delete the complaint
		const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);
		if (!deletedComplaint) {
			return res.status(404).json({ error: "Complaint not found" });
		}

		// Delete all related documents in other collections
		await Promise.all([
			Comment.deleteMany({ complaintId }),
			Like.deleteMany({ complaintId }),
		]);

		res.status(200).json({ message: "Complaint and related data deleted" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
exports.getComplaintsByStatus = async (req, res) => {
	try {
		const { status } = req.params; // status passed in route params
		if (!status) {
			return res.status(400).json({ message: "Status is required" });
		}

		const complaints = await Complaint.find({ status });

		res.status(200).json(complaints || []);
	} catch (error) {
		console.error("Error fetching complaints by status:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
/* ----------------------------nEW--------------------------------- */
exports.getAllComplaints = async (req, res) => {
	try {
		const complaints = await Complaint.find()
			.populate("userID", "name avatar")
			.populate({
				path: "comments",
				populate: { path: "userID", select: "name avatar" },
			})
			.populate({
				path: "likes",
				populate: { path: "userID", select: "name avatar" },
			})
			.sort({ createdAt: -1 });

		res.json(complaints);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
};

exports.getComplaintByID = async (req, res) => {
	try {
		const complaint = await Complaint.findById(req.params.id)
			.populate("userID", "name avatar")
			.populate({
				path: "comments",
				populate: {
					path: "userID",
					select: "name avatar",
				},
			})
			.populate({
				path: "likes",
				populate: {
					path: "userID",
					select: "name avatar",
				},
			})
			.populate("assignedTo", "name avatar")
			.populate("resolvedBy", "name avatar")
			.populate("assignedBy", "name avatar");

		res.status(200).json(complaint || []);
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};
// GET complaints assigned to a user
exports.getComplaintsByUser = async (req, res) => {
	try {
		const userId = req.params.userId; // passed in URL

		const complaints = await Complaint.find({ assignedTo: userId })
			.populate("assignedTo", "name phoneNo avatar")
			.populate("resolvedBy", "name phoneNo avatar")
			.populate("assignedBy", "name phoneNo avatar")
			.populate("type subtype"); // optional: populate category info

		res.status(200).json(complaints);
	} catch (error) {
		console.error("Error fetching user complaints:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

/* ----------------------------Using Multer--------------------------------- */

exports.updateComplaintRaisedImage = async (req, res) => {
	try {
		const complaintID = req.params.id;

		if (!req.file) {
			return res.status(400).json({
				status: false,
				error: "No file uploaded.",
			});
		}

		const imagePath = `uploads/complaint/${req.file.filename}`;

		const complaint = await Complaint.findByIdAndUpdate(
			complaintID,
			{ beforeImage: imagePath },
			{ new: true }
		);

		return res.status(200).json({
			status: true,
			message: "Image updated",
			data: complaint || [],
		});
	} catch (err) {
		console.error("Error updating image:", err);
		return res.status(500).json({
			status: false,
			error: "Internal Server Error",
		});
	}
};
