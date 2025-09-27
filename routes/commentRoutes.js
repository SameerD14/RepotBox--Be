const express = require("express");
const router = express.Router();
const { addComment, getComments } = require("../controllers/commentController");

router.post("/:id/comments", addComment);
router.get("/:id", getComments);
module.exports = router;
