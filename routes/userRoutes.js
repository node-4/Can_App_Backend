require('dotenv').config()
const express = require('express');
const auth = require("../controller/userController");
const authJwt = require("../middlewares/authJwt");
const { upload } = require('../middlewares/imageUpload')
module.exports = (app) => {
        app.post('/login', auth.login)
        app.post('/verify-otp/:id', auth.verifyOTP);
        app.post('/resend-otp/:id', auth.resendOTP);
        app.put('/update', authJwt.verifyToken, auth.updateUser);
        app.put('/updateProfile', upload.single('image'), authJwt.verifyToken, auth.updateProfileImage);
        app.post('/createResume', authJwt.verifyToken, auth.createResume);
        app.put('/edit/:resumeId', auth.editResume);
        app.put('/update-images/:resumeId', auth.updateImages);
        app.put('/update/videos/:resumeId', auth.updateVideos);
        app.get('/get-resume/:resumeId', auth.getResumeById);
        app.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct plese provide a proper end-point" }) })
};
