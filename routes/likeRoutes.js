const express = require("express");
const router = express.Router();
const { toggleLike, checkUserLike } = require("../controllers/likeController");

router.post("/:id/likes/toggle", toggleLike);
router.get("/check-like", checkUserLike);
module.exports = router;
