const User = require("../models/User");
const Group = require("../models/Group");
const GroupUser = require("../models/GroupUser");

const { generateOtp } = require("../utils/generateOtp");
const { sendOtpMail } = require("../utils/sendOtpMail");

// ✅ Send OTP
exports.sendOtp = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email)
			return res.status(400).json({ message: "Email is required" });

		let user = await User.findOne({ email });
		const otp = generateOtp();
		const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

		if (!user) {
			// Register new user
			user = new User({
				email,
				// UID: generateUserID(),
			});
		}

		user.otp = otp;
		user.otpExpiresAt = otpExpiresAt;

		await user.save();
		await sendOtpMail(email, otp);

		res.status(200).json({ message: "OTP sent to email", status: true });
	} catch (error) {
		console.error("Send OTP Error:", error);
		res.status(500).json({ error: error.message, status: false });
	}
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			return res
				.status(400)
				.json({ message: "Email and OTP are required" });
		}

		const user = await User.findOne({ email });

		if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
			return res.status(401).json({ message: "Invalid or expired OTP" });
		}

		// OTP verified, clear it
		user.otp = undefined;
		user.otpExpiresAt = undefined;
		await user.save();
		// Check if user is fully registered (based on phoneNo presence)
		const isRegistered = !!user.phoneNo;
		res.status(200).json({
			message: "OTP verified",
			userID: user._id,
			isRegistered,
			status: true,
		});
	} catch (error) {
		console.error("Verify OTP Error:", error);
		res.status(500).json({ error: error.message, status: false });
	}
};
exports.verifyOtpAndLogin = async (req, res) => {
	try {
		const { email, otp } = req.body;

		// 1. Find user
		let user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// 2. Validate OTP
		if (
			user.otp !== otp ||
			!user.otpExpiresAt ||
			user.otpExpiresAt < new Date()
		) {
			return res.status(400).json({ message: "Invalid or expired OTP" });
		}

		// 3. Clear OTP
		user.otp = undefined;
		user.otpExpiresAt = undefined;
		await user.save();

		// 4. Map to "users" group if not mapped
		let group = await Group.findOne({ name: "users" });
		if (!group) {
			group = await Group.create({ name: "users" });
		}

		const existingMapping = await GroupUser.findOne({
			userId: user._id,
			groupId: group._id,
		});

		if (!existingMapping) {
			await GroupUser.create({
				userId: user._id,
				groupId: group._id,
			});
		}

		// 5. Check if user has completed profile (e.g. has phoneNo)
		const isRegistered = !!user.phoneNo;

		return res.status(200).json({
			isRegistered,
			status: isRegistered ? "existing_user" : "new_user",
			userID: user._id,
			message: isRegistered
				? "Login successful, redirect to dashboard"
				: "Redirect to user info form",
		});
	} catch (err) {
		console.error("OTP verification error:", err);
		res.status(500).json({ message: "Server error" });
	}
};
