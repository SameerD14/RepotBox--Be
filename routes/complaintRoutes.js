const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const uploadComplaint = require("../middlewares/uploadComplaint");

/* ----------------------------Using Multer--------------------------------- */
router.patch(
	"/update/raised-image/:id",
	uploadComplaint.single("beforeImage"),
	complaintController.updateComplaintRaisedImage
);
/* ------------------------------------------------------------------- */
router.post("/", complaintController.createComplaint);
router.get("/", complaintController.getAllComplaints);
router.get("/:id", complaintController.getComplaintByID);
router.get("/user/:id", complaintController.getComplaintByUserID);
router.patch("/:id", complaintController.updateComplaintByID);
router.delete("/:id", complaintController.deleteComplaintByID);

router.get("/assigned/:userId", complaintController.getComplaintsByUser);
module.exports = router;
