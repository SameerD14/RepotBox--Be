const GroupRight = require("../models/GroupRight");

// Create mapping: Assign Right to Group
exports.assignSingleRightToGroup = async (req, res) => {
	try {
		const { groupId, rightId } = req.body;

		const exists = await GroupRight.findOne({ groupId, rightId });
		if (exists)
			return res.status(400).json({ message: "Mapping already exists" });

		const mapping = await GroupRight.create({ groupId, rightId });
		res.status(201).json(mapping);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
exports.assignRightsToGroup1 = async (req, res) => {
	try {
		const { groupId, rightIds } = req.body;

		if (!Array.isArray(rightIds) || rightIds.length === 0) {
			return res
				.status(400)
				.json({ message: "rightIds must be a non-empty array" });
		}

		const results = {
			added: [],
			skipped: [],
		};

		for (const rightId of rightIds) {
			const exists = await GroupRight.findOne({ groupId, rightId });

			if (exists) {
				results.skipped.push(rightId);
				continue;
			}

			const mapping = await GroupRight.create({ groupId, rightId });
			results.added.push(mapping);
		}

		res.status(201).json(results);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
// Assign rights to a group
exports.assignRightsToGroup = async (req, res) => {
	try {
		const { groupId, rightIds } = req.body;

		if (!Array.isArray(rightIds)) {
			return res
				.status(400)
				.json({ message: "rightIds must be an array" });
		}

		// Fetch current assignments
		const existingRights = await GroupRight.find({ groupId }).select(
			"rightId"
		);
		const existingRightIds = existingRights.map((r) =>
			r.rightId.toString()
		);

		// Rights to add
		const toAdd = rightIds.filter((id) => !existingRightIds.includes(id));
		// Rights to remove
		const toRemove = existingRightIds.filter(
			(id) => !rightIds.includes(id)
		);

		// Add new rights
		const added = [];
		for (const rightId of toAdd) {
			const mapping = await GroupRight.create({ groupId, rightId });
			added.push(mapping);
		}

		// Remove rights
		await GroupRight.deleteMany({ groupId, rightId: { $in: toRemove } });

		return res.status(200).json({
			message: "Group rights updated successfully",
			added,
			removed: toRemove,
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

// Get all group-right mappings
exports.getAllGroupRights = async (req, res) => {
	try {
		const mappings = await GroupRight.find()
			.populate("groupId", "name")
			.populate("rightId", "name");
		res.status(200).json(mappings);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
exports.getRightsByGroupId = async (req, res) => {
	try {
		const { groupId } = req.params;

		if (!groupId) {
			return res.status(400).json({ message: "groupId is required" });
		}

		const rights = await GroupRight.find({ groupId })
			.populate("rightId", "name description") // populate right details
			.select("rightId"); // only return rightId field from GroupRight

		const formattedRights = rights.map((entry) => entry.rightId); // extract right objects

		res.status(200).json(formattedRights);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Delete mapping: Remove Right from Group
exports.removeRightFromGroup = async (req, res) => {
	try {
		const { groupId, rightId } = req.body;
		const deleted = await GroupRight.findOneAndDelete({ groupId, rightId });
		if (!deleted)
			return res.status(404).json({ message: "Mapping not found" });
		res.status(200).json({ message: "Right removed from group" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
