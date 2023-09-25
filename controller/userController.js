require('dotenv').config()
const userDb = require('../model/userModel');
const ResumeDb = require('../model/resumeModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const qr = require('qrcode');
const { updateUserValidation } = require('../validation/userValidation');
const { nameRegex, passwordRegex, emailRegex, mobileRegex, objectId, isValidBody, isValid, isValidField } = require('../validation/commonValidation')
const { createResumeValidation, updateResumeValidation, getResumeByIdValidation } = require('../validation/resumeValidation');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.cloud_name, api_key: process.env.api_key, api_secret: process.env.api_secret });


exports.login = async (req, res) => {
    try {
        const data = req.body;
        const { mobileNumber } = data;
        if (!isValidBody(req.body)) {
            return res.status(400).json({ status: 400, message: "Body can't be empty, please enter some data" });
        }
        if (!mobileNumber) {
            return res.status(400).json({ status: 400, message: "Mobile number is required" });
        }
        if (!isValid(mobileNumber)) {
            return res.status(400).json({ status: 400, message: "Mobile number is not valid" });
        }
        if (!mobileRegex.test(mobileNumber)) {
            return res.status(406).json({ status: 406, message: "Mobile number is not valid" });
        }
        const user = await userDb.findOne({ mobileNumber })
        if (!user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            let obj = { mobileNumber, otp, profileImage: '.', otpExpired: new Date(Date.now() + 5 * 60 * 1000) }
            const user1 = await userDb.create(obj);
            return res.status(201).json({ status: 201, message: "Signup successful", user1 });
        } else {
            user.otpExpired = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = Math.floor(100000 + Math.random() * 900000).toString();
            await user.save();
            return res.status(200).json({ status: 200, message: "Login successful", data: user, });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};
exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await userDb.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ status: 404, message: "user not found" });
        }
        if (user.otp !== otp || user.otpExpired < Date.now()) {
            return res.status(400).json({ status: 400, message: "Invalid OTP" });
        }
        const updated = await userDb.findByIdAndUpdate({ _id: user._id }, { isVerified: true }, { new: true });
        const accessToken = jwt.sign({ id: user._id }, process.env.USER_SECRET_KEY, { expiresIn: '365d', });
        return res.status(200).send({ status: 200, message: "logged in successfully", accessToken: accessToken, data: updated });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ status: 500, error: "internal server error" + err.message });
    }
};
exports.resendOTP = async (req, res) => {
    try {
        const user = await userDb.findById(req.params.id)
        if (!user) {
            return res.status(400).json({ status: 400, message: "User not found" });
        }
        user.otpExpired = new Date(Date.now() + 5 * 60 * 1000);
        user.otp = Math.floor(100000 + Math.random() * 900000).toString();
        await user.save();
        return res.status(200).json({ status: 200, message: "OTP resent successfully", user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to resend OTP' });
    }
};
exports.updateUser = async (req, res) => {
    try {
        let userId = req.user._id;
        userId = userId.toString()
        const { name, nowDoing } = req.body;
        const { error } = updateUserValidation.validate({ userId, name, nowDoing });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }
        const user = await userDb.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        user.name = name;
        user.nowDoing = nowDoing;
        await user.save();
        return res.status(200).json({ status: 200, message: "User updated successfully", user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateProfileImage = async (req, res) => {
    try {
        let imageUrl;
        if (req.file) {
            imageUrl = req.file.path;
        } else {
            return res.status(404).json({ status: 404, message: 'Please first chosse an image.', });
        }
        let userId = req.user._id;
        userId = userId.toString()
        const user = await userDb.findById(userId);
        if (!user) {
            return res.status(404).send({ status: 404, message: "user not found" });
        }
        const user1 = await userDb.findByIdAndUpdate(userId, { $set: { profileImage: imageUrl } }, { new: true });
        return res.status(200).json({ status: 200, message: 'Profile image updated successfully', user1 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update Profile image' });
    }
};
exports.createResume = async (req, res) => {
    try {
        const { image, name, summary, workingstatus, experience, education, certifications, skills, achievements, personalDetails, declartion, } = req.body;
        const { error } = createResumeValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }
        const user = await userDb.findById({ _id: req.user._id });
        if (!user) {
            return res.status(404).send({ status: 404, message: "user not found" });
        }
        let userId = user._id;
        const newResume = new ResumeDb({ userId, image, name, summary, workingstatus, experience, education, certifications, skills, achievements, personalDetails, declartion, });
        const savedResume = await newResume.save();
        return res.status(201).json({ status: 201, message: 'Resume created successfully', data: savedResume, });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create resume' });
    }
};
exports.editResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { image, name, summary, workingstatus, experience, education, certifications, skills, achievements, personalDetails, declartion, } = req.body;
        const { error } = updateResumeValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }
        const updatedResume = await ResumeDb.findByIdAndUpdate(resumeId, { image, name, summary, workingstatus, experience, education, certifications, skills, achievements, personalDetails, declartion, }, { new: true });
        if (!updatedResume) {
            return res.status(404).json({ status: 404, message: 'Resume not found' });
        }
        return res.status(200).json({ status: 200, message: 'Resume updated successfully', data: updatedResume, });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update resume' });
    }
};
exports.updateImages = async (req, res) => {
    try {
        await upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: 'Error uploading images', err });
            } else if (err) {
                return res.status(500).json({ error: 'An unknown error occurred', err });
            }
            const resumeId = req.params.resumeId;
            const updates = {};
            if (req.files['image']) {
                updates['image'] = req.files['image'][0].path;
            }
            if (req.files['summaryImage']) {
                updates['summary.image'] = req.files['summaryImage'][0].path;
            }
            if (req.files['experience[0][experience][image]']) {
                updates['experience.0.experience.image'] = req.files['experience[0][experience][image]'][0].path;
            }
            if (req.files['experience[0][experties][image]']) {
                updates['experience.0.experties.image'] = req.files['experience[0][experties][image]'][0].path;
            }
            if (req.files['educationImage']) {
                updates['education.0.image'] = req.files['educationImage'][0].path;
            }
            if (req.files['certificationsImage']) {
                updates['certifications.0.image'] = req.files['certificationsImage'][0].path;
            }
            if (req.files['skills.softSkills.image']) {
                updates['skills.0.softSkills.image'] = req.files['skills.softSkills.image'][0].path;
            }
            if (req.files['skills.itSkills.image']) {
                updates['skills.0.itSkills.image'] = req.files['skills.itSkills.image'][0].path;
            }
            if (req.files['skills.technicalSkills.image']) {
                updates['skills.0.technicalSkills.image'] = req.files['skills.technicalSkills.image'][0].path;
            }
            if (req.files['skills.managementSkills.image']) {
                updates['skills.0.managementSkills.image'] = req.files['skills.managementSkills.image'][0].path;
            }
            if (req.files['skills.generalSkills.image']) {
                updates['skills.0.generalSkills.image'] = req.files['skills.generalSkills.image'][0].path;
            }
            if (req.files['achievements[0][image]']) {
                updates['achievements.0.image'] = req.files['achievements[0][image]'][0].path;
            }
            const resume = await ResumeDb.findByIdAndUpdate(resumeId, { $set: updates }, { new: true });
            if (!resume) {
                return res.status(404).json({ status: 404, message: 'Resume not found' });
            }
            return res.status(200).json({ status: 200, message: 'Images updated successfully', user: resume });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update images' });
    }
};
exports.updateVideos = async (req, res) => {
    try {
        await upload1(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: 'Error uploading videos', err });
            } else if (err) {
                return res.status(500).json({ error: 'An unknown error occurred', err });
            }
            const resumeId = req.params.resumeId;
            const updates = {
                'summary.video': req.files['summaryVideo'] ? req.files['summaryVideo'][0].path : undefined,
                'experience.0.experience.video': req.files['experience[0][experience][video]'] ? req.files['experience[0][experience][video]'][0].path : undefined,
                'experience.0.experties.video': req.files['experience[0][experties][video]'] ? req.files['experience[0][experties][video]'][0].path : undefined,
                'education.0.video': req.files['educationVideo'] ? req.files['educationVideo'][0].path : undefined,
                'certifications.0.video': req.files['certificationsVideo'] ? req.files['certificationsVideo'][0].path : undefined,
                'skills.0.softSkills.video': req.files['skills.softSkills.video'] ? req.files['skills.softSkills.video'][0].path : undefined,
                'skills.0.itSkills.video': req.files['skills.itSkills.video'] ? req.files['skills.itSkills.video'][0].path : undefined,
                'skills.0.technicalSkills.video': req.files['skills.technicalSkills.video'] ? req.files['skills.technicalSkills.video'][0].path : undefined,
                'skills.0.managementSkills.video': req.files['skills.managementSkills.video'] ? req.files['skills.managementSkills.video'][0].path : undefined,
                'skills.0.generalSkills.video': req.files['skills.generalSkills.video'] ? req.files['skills.generalSkills.video'][0].path : undefined,
                'achievements.0.video': req.files['achievements[0][video]'] ? req.files['achievements[0][video]'][0].path : undefined,
            };
            const resume = await ResumeDb.findByIdAndUpdate(resumeId, { $set: updates }, { new: true });
            if (!resume) {
                return res.status(404).json({ status: 404, message: 'Resume not found' });
            }
            return res.status(200).json({ status: 200, message: 'Videos updated successfully', user: resume });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update videos' });
    }
};
exports.getResumeById = async (req, res) => {
    try {
        const resumeId = req.params.resumeId;

        const { error } = getResumeByIdValidation.validate({ resumeId });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const resume = await ResumeDb.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ status: 404, message: 'Resume not found' });
        }
        return res.status(200).json({
            status: 200,
            message: 'Resume details retrieved successfully',
            resume,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve resume details' });
    }
};































// Create Cloudinary storage
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "images/image", allowed_formats: ["jpg", "jpeg", "png", "xlsx", "xls", "pdf", "PDF"], }, });
// Define the fields to upload
const fieldsToUpload = [
    { name: 'image', maxCount: 1 },
    { name: 'summaryImage', maxCount: 1 },
    { name: 'experience[0][experience][image]', maxCount: 1 },
    { name: 'experience[0][experties][image]', maxCount: 1 },
    { name: 'educationImage', maxCount: 1 },
    { name: 'certificationsImage', maxCount: 1 },
    { name: 'skills.softSkills.image', maxCount: 1 },
    { name: 'skills.itSkills.image', maxCount: 1 },
    { name: 'skills.technicalSkills.image', maxCount: 1 },
    { name: 'skills.managementSkills.image', maxCount: 1 },
    { name: 'skills.generalSkills.image', maxCount: 1 },
    { name: 'achievements[0][image]', maxCount: 1 },

];
const upload = multer({ storage: storage }).fields(fieldsToUpload);
// // upload image End




// video upload Start
const storage1 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "videos",
        resource_type: "video",
        allowed_formats: ['mp4', 'mov', 'avi'],
    },
});
// Define the fields to upload
const fieldsToUpload1 = [
    // ... other fields
    { name: 'summaryVideo', maxCount: 1 },
    { name: 'experience[0][experience][video]', maxCount: 1 },
    { name: 'experience[0][experties][video]', maxCount: 1 },
    { name: 'educationVideo', maxCount: 1 },
    { name: 'certificationsVideo', maxCount: 1 },
    { name: 'skills.softSkills.video', maxCount: 1 },
    { name: 'skills.itSkills.video', maxCount: 1 },
    { name: 'skills.technicalSkills.video', maxCount: 1 },
    { name: 'skills.managementSkills.video', maxCount: 1 },
    { name: 'skills.generalSkills.video', maxCount: 1 },
    { name: 'achievements[0][video]', maxCount: 1 },
];
const upload1 = multer({ storage: storage1 }).fields(fieldsToUpload1);
// video upload End