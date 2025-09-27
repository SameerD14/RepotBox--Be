const GroupUser = require("../models/GroupUser");
const Group = require("../models/Group");
const User = require("../models/User");

exports.assignSingleUserToGroup = async (req, res) => {
	try {
		const { groupId, userId } = req.body;

		const exists = await GroupUser.findOne({ groupId, userId });
		if (exists)
			return res.status(400).json({ message: "Mapping already exists" });

		const mapping = await GroupUser.create({ groupId, userId });
		res.status(201).json(mapping);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
exports.assignUsersToGroup1 = async (req, res) => {
	try {
		const { groupId, userIds } = req.body;

		if (!Array.isArray(userIds) || userIds.length === 0) {
			return res
				.status(400)
				.json({ message: "userIds must be a non-empty array" });
		}

		const results = {
			added: [],
			skipped: [],
		};

		for (const userId of userIds) {
			const exists = await GroupUser.findOne({ groupId, userId });

			if (exists) {
				results.skipped.push(userId);
				continue;
			}

			const mapping = await GroupUser.create({ groupId, userId });
			results.added.push(mapping);
		}

		res.status(201).json(results);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
exports.assignUsersToGroup = async (req, res) => {
	try {
		const { groupId, userIds } = req.body;

		if (!Array.isArray(userIds)) {
			return res
				.status(400)
				.json({ message: "userIds must be an array" });
		}

		// Fetch current assignments
		const existingUsers = await GroupUser.find({ groupId }).select(
			"userId"
		);

		const existingUserIds = existingUsers.map((u) => u.userId.toString());

		// Users to add
		const toAdd = userIds.filter((id) => !existingUserIds.includes(id));
		// Users to remove
		const toRemove = existingUserIds.filter((id) => !userIds.includes(id));

		// Add new users
		const added = [];
		for (const userId of toAdd) {
			const mapping = await GroupUser.create({ groupId, userId });
			added.push(mapping);
		}

		// Remove users
		await GroupUser.deleteMany({ groupId, userId: { $in: toRemove } });

		return res.status(200).json({
			message: "Group updated successfully",
			added,
			removed: toRemove,
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};
exports.getAllGroupUser = async (req, res) => {
	try {
		const mappings = await GroupUser.find()
			.populate("groupId", "name")
			.populate("userId", "name");
		res.status(200).json(mappings);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
exports.getUsersByGroupId = async (req, res) => {
	try {
		const { groupId } = req.params;

		if (!groupId) {
			return res.status(400).json({ message: "groupId is required" });
		}

		const users = await GroupUser.find({ groupId })
			.populate("userId", "name description")
			.select("userId");

		const formattedUsers = users.map((entry) => entry.userId);

		res.status(200).json(formattedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
exports.removeUserFromGroup = async (req, res) => {
	try {
		const { groupId, userId } = req.body;
		const deleted = await GroupUser.findOneAndDelete({ groupId, userId });
		if (!deleted)
			return res.status(404).json({ message: "Mapping not found" });
		res.status(200).json({ message: "Users removed from group" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
exports.getUsersByGroup = async (req, res) => {
	try {
		const { groupName } = req.params; // e.g. "admin", "worker", "user"

		// 1. Find the group
		const group = await Group.findOne({ name: groupName });
		if (!group) {
			return res.status(404).json({ message: "Group not found" });
		}

		// 2. Find all mappings of that group
		const mappings = await GroupUser.find({ groupId: group._id });

		const userIds = mappings.map((m) => m.userId);

		// 3. Fetch users by IDs
		const users = await User.find({ _id: { $in: userIds } });

		return res.status(200).json({
			group: group.name,
			count: users.length,
			users,
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};
