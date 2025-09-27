const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middlewares/upload");

/* ----------------------------Using Multer--------------------------------- */

router.post(
	"/create",
	upload.single("avatar"),
	userController.createUserWithAvatar
);

router.patch(
	"/update/:id",
	upload.single("avatar"),
	userController.updateUserDetailswithAvatarByID
);

router.patch(
	"/update/avatar/:id",
	upload.single("avatar"),
	userController.updateUserAvatar
);
/* -------------------------------------------------------------------------- */

router.patch("/update/details/:id", userController.updateUserDetailsByID);
router.get("/", userController.getAllUsers);
router.get("/details/:id", userController.getUserFullDetailsByID);

router.get("/:id", userController.getUserByID);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/full-info/:id", userController.getUserFullInfo);
module.exports = router;
