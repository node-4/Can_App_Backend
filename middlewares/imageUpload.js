var multer = require("multer");
const authConfig = require("../configs/auth.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: 'djgrqoefp',
    api_key: '274167243253962',
    api_secret: '3mkqkDDusI5Hf4flGNkJNz4PHYg'
});
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "jatinTangra/images/Product", allowed_formats: ["webp", "avif", "jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'image', maxCount: 10 }, { name: 'video', maxCount: 10 },]);

module.exports = { upload, cpUpload };


// video upload End