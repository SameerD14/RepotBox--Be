const express = require("express");
const pushTokenController = require("../controllers/pushTokenController");
const router = express.Router();

router.post("/", pushTokenController.storeOrUpdateToken);
router.get("/", pushTokenController.getTokens);
router.get("/:userId", pushTokenController.getTokenByUserID);
router.delete("/:userId", pushTokenController.deleteTokenByUserID);
module.exports = router;
