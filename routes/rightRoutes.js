const express = require("express");
const router = express.Router();
const rightObjectController = require("../controllers/rightController");

router.post("/", rightObjectController.createRightObject);
router.get("/", rightObjectController.getAllRightObjects);
router.get("/:id", rightObjectController.getRightObjectById);
router.patch("/:id", rightObjectController.updateRightObject);
router.delete("/:id", rightObjectController.deleteRightObject);

module.exports = router;
