const User = require("../models/User");
const Group = require("../models/Group");
const GroupUser = require("../models/GroupUser");
const Right = require("../models/Right");
const GroupRight = require("../models/GroupRight");
const { generateUserID } = require("../utils/generateOtp");
const Complaint = require("../models/Complaint");
const Comment = require("../models/Comment.js");
const Like = require("../models/Like.js");
const PushToken = require("../models/PushToken");
/* ----------------------------Using Multer--------------------------------- */

exports.createUserWithAvatar = async (req, res) => {
	try {
		const {
			name,
			state,
			city,
			doorNo,
			street,
			phoneNo,
			pin,
			email,
			groupIDs, // optional from frontend
		} = req.body;

		const avatarPath = req.file ? `/uploads/user/${req.file.filename}` : "";

		// Ensure groupIDs is an array with one group only
		let resolvedGroupIDs =
			groupIDs && groupIDs.length > 0 ? [groupIDs[0]] : [];

		if (resolvedGroupIDs.length === 0) {
			let defaultGroup = await Group.findOne({ name: "users" });

			if (!defaultGroup) {
				// Create the default group if it doesn't exist
				defaultGroup = await Group.create({
					name: "users",
					description: "Generated automatically on user creation",
				});
			}

			resolvedGroupIDs = [defaultGroup._id];
		}

		// Generate a unique UID
		let UID;
		let exists = true;
		while (exists) {
			UID = generateUserID();
			exists = await User.findOne({ UID });
		}

		const user = await User.create({
			name,
			state,
			city,
			doorNo,
			street,
			UID,
			phoneNo,
			pin,
			email,
			groupIDs: resolvedGroupIDs, // ✅ corrected here
			avatar: avatarPath,
		});

		res.status(201).json(user);
	} catch (error) {
		console.error("Create User Error:", error);
		res.status(400).json({ error: error.message });
	}
};
exports.updateUserDetailswithAvatarByID = async (req, res) => {
	try {
		const { name, state, city, doorNo, street, phoneNo, pin, gender } =
			req.body;

		const avatarPath = req.file ? `/uploads/user/${req.file.filename}` : "";

		const userBody = await User.findById(req.params.id);
		if (!userBody) {
			return res.status(404).json({ error: "User not found" });
		}

		// Only generate a UID if it's not already set
		let UID = userBody.UID;
		if (!UID) {
			let exists = true;
			while (exists) {
				UID = generateUserID();
				exists = await User.findOne({ UID });
			}
		}
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{
				name,
				state,
				city,
				doorNo,
				street,
				UID,
				gender,
				phoneNo,
				pin,
				avatar: avatarPath,
			},
			{
				new: true,
			}
		);

		res.status(201).json(user);
	} catch (error) {
		console.error("Create User Error:", error);
		res.status(400).json({ error: error.message });
	}
};
exports.updateUserAvatar = async (req, res) => {
	try {
		const userId = req.params.id;

		if (!req.file) {
			return res
				.status(400)
				.json({ status: false, error: "No file uploaded." });
		}

		const avatarPath = `/uploads/user/${req.file.filename}`;

		console.log("here ", avatarPath);
		const user = await User.findByIdAndUpdate(
			userId,
			{ avatar: avatarPath },
			{ new: true }
		);
		console.log(user);

		if (!user) {
			return res
				.status(404)
				.json({ status: false, error: "User not found." });
		}

		return res.status(200).json({
			status: true,
			message: "Avatar updated",
			data: user,
		});
	} catch (err) {
		console.error("Error updating avatar:", err);
		return res
			.status(500)
			.json({ status: false, error: "Internal Server Error" });
	}
};
/* ------------------------------------------------------------- */

exports.updateUserDetailsByID = async (req, res) => {
	try {
		const userBody = await User.findById(req.params.id);
		if (!userBody) {
			return res.status(404).json({ error: "User not found" });
		}

		const {
			name,
			state,
			city,
			doorNo,
			street,
			phoneNo,
			gender,
			avatar,
			groupIDs,
		} = req.body;

		// Only generate a UID if it's not already set
		let UID = userBody.UID;
		if (!UID) {
			let exists = true;
			while (exists) {
				UID = generateUserID();
				exists = await User.findOne({ UID });
			}
		}

		// Resolve group IDs
		let resolvedGroupIDs =
			groupIDs && groupIDs.length > 0 ? [groupIDs[0]] : userBody.groupIDs;

		if (!resolvedGroupIDs || resolvedGroupIDs.length === 0) {
			let defaultGroup = await Group.findOne({ name: "users" });

			if (!defaultGroup) {
				defaultGroup = await Group.create({
					name: "users",
					description: "Generated automatically on user creation",
				});
			}

			resolvedGroupIDs = [defaultGroup._id];
		}

		// Build update object, excluding undefined or empty string fields
		const updateData = {};
		if (name) updateData.name = name;
		if (state) updateData.state = state;
		if (city) updateData.city = city;
		if (doorNo) updateData.doorNo = doorNo;
		if (street) updateData.street = street;
		if (phoneNo) updateData.phoneNo = phoneNo;
		if (gender) updateData.gender = gender;
		if (avatar) updateData.avatar = avatar;

		// updateData.groupIDs = resolvedGroupIDs;
		updateData.UID = UID;

		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{ $set: updateData },
			{ new: true, runValidators: true }
		);

		res.status(200).json(updatedUser);
	} catch (error) {
		console.error("Update User Error:", error);
		res.status(400).json({ error: error.message });
	}
};

exports.getAllUsers = async (req, res) => {
	try {
		// 1️⃣ Get all users
		const users = await User.find().lean();
		if (!users.length) {
			return res.status(200).json([]);
		}

		const userIds = users.map((u) => u._id);

		// 2️⃣ Get all GroupUser mappings for all users
		const groupUsers = await GroupUser.find({
			userId: { $in: userIds },
		}).lean();
		const groupIds = [
			...new Set(groupUsers.map((g) => g.groupId.toString())),
		];

		// 3️⃣ Get group details
		const groups = await Group.find({ _id: { $in: groupIds } }).lean();
		const groupsById = Object.fromEntries(
			groups.map((g) => [g._id.toString(), g])
		);

		// 4️⃣ Get GroupRight mappings for all groups
		const groupRights = await GroupRight.find({
			groupId: { $in: groupIds },
		}).lean();
		const rightIds = [
			...new Set(groupRights.map((gr) => gr.rightId.toString())),
		];

		// 5️⃣ Get right details
		const rights = await Right.find({ _id: { $in: rightIds } }).lean();
		const rightsById = Object.fromEntries(
			rights.map((r) => [r._id.toString(), r])
		);

		// 6️⃣ Get complaints for all users in one go
		const complaints = await Complaint.find({
			userID: { $in: userIds },
		}).lean();

		// Group complaints by userId for quick lookup
		const complaintsByUser = {};
		complaints.forEach((c) => {
			const uid = c.userID.toString();
			if (!complaintsByUser[uid]) {
				complaintsByUser[uid] = [];
			}
			complaintsByUser[uid].push(c);
		});

		// 7️⃣ Assemble final array
		const usersWithDetails = users.map((user) => {
			// Groups for this user
			const userGroupIds = groupUsers
				.filter((g) => g.userId.toString() === user._id.toString())
				.map((g) => g.groupId.toString());

			const userGroups = userGroupIds
				.map((gid) => groupsById[gid])
				.filter(Boolean);

			// Rights for this user
			const userRightIds = groupRights
				.filter((gr) => userGroupIds.includes(gr.groupId.toString()))
				.map((gr) => gr.rightId.toString());

			const userRights = [...new Set(userRightIds)]
				.map((rid) => rightsById[rid])
				.filter(Boolean);

			return {
				...user,
				groups: userGroups,
				rights: userRights,
				complaints: complaintsByUser[user._id.toString()] || [],
			};
		});

		res.status(200).json(usersWithDetails);
	} catch (error) {
		console.error("Get All Users Error:", error);
		res.status(500).json({ error: error.message });
	}
};
exports.getUserByID = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.status(200).json(user);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
exports.getUserFullDetailsByID = async (req, res) => {
	try {
		const userId = req.params.id;

		// 1️⃣ Get the user
		const user = await User.findById(userId).lean();
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// 2️⃣ Get all GroupUser mappings for this user
		const groupUsers = await GroupUser.find({ userId }).lean();
		const groupIds = [
			...new Set(groupUsers.map((g) => g.groupId.toString())),
		];

		// 3️⃣ Get group details
		const groups = await Group.find({ _id: { $in: groupIds } }).lean();

		// 4️⃣ Get GroupRight mappings for this user's groups
		const groupRights = await GroupRight.find({
			groupId: { $in: groupIds },
		}).lean();
		const rightIds = [
			...new Set(groupRights.map((gr) => gr.rightId.toString())),
		];

		// 5️⃣ Get right details
		const rights = await Right.find({
			_id: { $in: rightIds },
		}).lean();

		// 6️⃣ Get complaints for this user
		const complaints = await Complaint.find({ userID: userId })
			.populate("userID", "name avatar")
			.populate("assignedTo", "name phoneNo avatar")
			.populate("resolvedBy", "name phoneNo avatar")
			.populate("assignedBy", "name phoneNo avatar")
			.populate("comments")
			.populate("likes")
			.sort("-createdAt")
			.lean();

		// 7️⃣ Final response
		res.status(200).json({
			...user,
			groups,
			rights,
			complaints,
		});
	} catch (error) {
		console.error("Get User Full Details Error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.updateUser = async (req, res) => {
	try {
		console.log(JSON.stringify(req.body, null, 1));

		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		res.status(200).json(user);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
exports.deleteUser = async (req, res) => {
	try {
		const { id } = req.params; // userId

		// 1. Check if user exists
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// 2. Delete all related entities
		await Promise.all([
			Complaint.deleteMany({ userID: id }),
			Like.deleteMany({ userID: id }),
			Comment.deleteMany({ userID: id }),
			GroupUser.deleteMany({ userId: id }),
			PushToken.deleteMany({ userId: id }),
		]);

		// 3. Delete the user itself
		await User.findByIdAndDelete(id);

		res.status(200).json({
			message: "User and all related data deleted successfully",
		});
	} catch (error) {
		console.error("Delete User Error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getUserFullInfo = async (req, res) => {
	try {
		const userId = req.params.id;

		// Step 1: Get user basic info
		const user = await User.findById(userId).lean();
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Step 2: Find groups the user belongs to
		const groupUsers = await GroupUser.find({ userId }).lean();
		const groupIds = groupUsers.map((g) => g.groupId);

		// Step 3: Get group details
		const groups = await Group.find(
			{ _id: { $in: groupIds } },
			"name" // projection: only return name
		).lean();
		const groupNames = groups.map((g) => g.name);

		// Step 4: Get rights from GroupRight mapping
		const groupRights = await GroupRight.find({
			groupId: { $in: groupIds },
		}).lean();

		const rightIds = groupRights.map((gr) => gr.rightId);

		// Step 5: Get right details (only names)
		const rights = await Right.find(
			{ _id: { $in: rightIds } },
			"key" // projection: only return name field
		).lean();

		// Extract only names into an array
		const rightNames = rights.map((r) => r.key);
		console.log(rightNames);

		// Final response
		return res.json({
			user,
			groups: groupNames,
			rights: rightNames,
		});
	} catch (error) {
		console.error("Error in getUserFullInfo:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
