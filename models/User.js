const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: String,
		state: String,
		city: String,
		doorNo: String,
		street: String,
		UID: { type: String, required: false, unique: true, sparse: true },
		phoneNo: { type: Number, unique: false },
		pin: Number,
		email: { type: String, unique: true, sparse: true },
		avatar: String,
		public_id: String,
		gender: {
			type: String,
			enum: ['Male', 'Female', 'Other'],
		},
		groupIDs: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Group',
			required: false,
		},
		otp: String,
		otpExpiresAt: Date,
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
