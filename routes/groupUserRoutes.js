const express = require("express");
const router = express.Router();
const groupUserController = require("../controllers/groupUserController");

router.post("/", groupUserController.assignUsersToGroup);
router.get("/", groupUserController.getAllGroupUser);
router.get("/:groupId/users", groupUserController.getUsersByGroupId);
router.get("/:groupName/users", groupUserController.getUsersByGroup);
router.delete("/:id", groupUserController.removeUserFromGroup);

module.exports = router;
