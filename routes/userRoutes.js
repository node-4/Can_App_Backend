require('dotenv').config()
const express = require('express');
const auth = require("../controller/userController");
const authJwt = require("../middlewares/authJwt");
const { upload } = require('../middlewares/imageUpload')
module.exports = (app) => {
        app.post('/user/login', auth.login)
        app.post('/user/verify-otp/:id', auth.verifyOTP);
        app.post('/user/resend-otp/:id', auth.resendOTP);
        app.put('/user/update', authJwt.verifyToken, auth.updateUser);
        app.put('/user/updateProfile', upload.single('image'), authJwt.verifyToken, auth.updateProfileImage);
        app.post('/user/createResume', authJwt.verifyToken, auth.createResume);
        app.put('/user/edit/:resumeId', auth.editResume);
        app.put('/user/update-images/:resumeId', auth.updateImages);
        app.put('/user/update/videos/:resumeId', auth.updateVideos);
        app.get('/user/get-resume/:resumeId', auth.getResumeById);
        // app.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct plese provide a proper end-point" }) })
};
