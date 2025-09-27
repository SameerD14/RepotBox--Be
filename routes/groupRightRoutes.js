const express = require("express");
const router = express.Router();
const groupRightController = require("../controllers/groupRightController");

router.post("/", groupRightController.assignRightsToGroup);
router.get("/", groupRightController.getAllGroupRights);
router.get("/:groupId/rights", groupRightController.getRightsByGroupId);
router.delete("/:id", groupRightController.removeRightFromGroup);

module.exports = router;
