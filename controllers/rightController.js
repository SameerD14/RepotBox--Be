const RightObject = require("../models/Right");
const GroupRight = require("../models/GroupRight");
// Create a RightObject
exports.createRightObject = async (req, res) => {
	try {
		const right = await RightObject.create(req.body);
		res.status(201).json(right);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// Get all RightObjects
exports.getAllRightObjects = async (req, res) => {
	try {
		const rights = await RightObject.find().sort({ _id: -1 });
		res.status(200).json(rights);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get single RightObject by ID
exports.getRightObjectById = async (req, res) => {
	try {
		const right = await RightObject.findById(req.params.id);
		if (!right) return res.status(404).json({ message: "Right not found" });
		res.status(200).json(right);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// Update RightObject
exports.updateRightObject = async (req, res) => {
	try {
		const updated = await RightObject.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updated)
			return res.status(404).json({ message: "Right not found" });
		res.status(200).json(updated);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// Delete RightObject
exports.deleteRightObject = async (req, res) => {
	try {
		const rightId = req.params.id;

		// Delete RightObject
		const deleted = await RightObject.findByIdAndDelete(rightId);
		if (!deleted) {
			return res.status(404).json({ message: "Right not found" });
		}

		// Delete from other collections that reference this right
		await Promise.all([GroupRight.deleteMany({ rightId })]);

		res.status(200).json({ message: "Right and related mappings deleted" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
