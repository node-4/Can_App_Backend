const express = require('express');
const router = express.Router();
const { createProfile, updateProfile, getProfileById } = require('../controller/profileController');


// upload image Start
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "images/image",
        allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
    },
});
const upload = multer({ storage: storage });
// upload image End


// router.post('/create', createProfile);
router.post('/createProfile', upload.single('image'), createProfile);

router.put('/profiles/:profileId', upload.single('image'), updateProfile);

router.get('/profile/:profileId', getProfileById);



module.exports = router;
