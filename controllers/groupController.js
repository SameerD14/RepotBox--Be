const Group = require("../models/Group");
const GroupUser = require("../models/GroupUser");
const GroupRight = require("../models/GroupRight");

exports.createGroup = async (req, res) => {
	try {
		const group = await Group.create(req.body);
		res.status(201).json(group);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.getAllGroups = async (req, res) => {
	try {
		const groups = await Group.find();
		res.status(200).json(groups);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getGroupsByID = async (req, res) => {
	try {
		const group = await Group.findById(req.params.id);

		res.status(200).json(group || []);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.updateGroup = async (req, res) => {
	try {
		const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		res.status(200).json(group);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deleteGroup = async (req, res) => {
	try {
		const groupId = req.params.id;

		// Delete the group itself
		const deletedGroup = await Group.findByIdAndDelete(groupId);
		if (!deletedGroup) {
			return res.status(404).json({ message: "Group not found" });
		}

		// Delete all references in other collections
		await Promise.all([
			GroupUser.deleteMany({ groupId }),
			GroupRight.deleteMany({ groupId }),
		]);

		res.status(200).json({ message: "Group and related mappings deleted" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
