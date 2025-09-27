const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const { Readable } = require("stream");

const router = express.Router();

// Multer memory storage to avoid local disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: Upload buffer stream to Cloudinary
const streamUpload = (buffer) =>
	new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream((error, result) => {
			if (result) resolve(result);
			else reject(error);
		});
		const readable = new Readable();
		readable._read = () => {};
		readable.push(buffer);
		readable.push(null);
		readable.pipe(stream);
	});

// CREATE - Upload Image
router.post("/", upload.single("image"), async (req, res) => {
	try {
		if (!req.file)
			return res.status(400).json({ error: "No image file provided" });

		const result = await streamUpload(req.file.buffer);

		res.status(201).json({
			message: "Image uploaded successfully",
			data: result,
		});
	} catch (error) {
		console.error("Upload error:", error);
		res.status(500).json({ error: error.message || "Unknown error" });
	}
});

// READ - Get Cloudinary image URL by public_id with transformations
router.get("/image/:public_id", (req, res) => {
	try {
		const { public_id } = req.params;
		const url = cloudinary.url(public_id, {
			width: 400,
			height: 400,
			crop: "fill",
			format: "jpg",
		});
		res.json({ url });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// UPDATE - Replace existing image with new one by public_id
router.put("/update/:public_id", upload.single("image"), async (req, res) => {
	try {
		const { public_id } = req.params;
		if (!req.file)
			return res.status(400).json({ error: "No image file provided" });

		// Delete old image
		await cloudinary.uploader.destroy(public_id);

		// Upload new image
		const result = await streamUpload(req.file.buffer);

		res.json({
			message: "Image updated successfully",
			data: result,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// DELETE - Delete image by public_id
router.delete("/delete/:public_id", async (req, res) => {
	try {
		const { public_id } = req.params;
		const result = await cloudinary.uploader.destroy(public_id);
		if (result.result !== "ok") {
			return res
				.status(404)
				.json({ error: "Image not found or already deleted" });
		}
		res.json({ message: "Image deleted successfully", result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
