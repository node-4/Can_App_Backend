const { string } = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    mobileNumber: {
        type: String,
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpired: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ["Admin", "User"],
        default: "User"
    },
    name: {
        type: String,
    },
    nowDoing: {
        type: String,
    },
    profileImage: { type: String },


}, { timestamps: true })

const user = mongoose.model('User', userSchema);


module.exports = user;
