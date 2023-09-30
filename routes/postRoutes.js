const express = require('express');
const router = express.Router();
const { upload, cpUpload } = require('../middlewares/imageUpload')
const auth = require('../controller/postController');
module.exports = (app) => {


    app.post('/post/create', cpUpload, auth.createPost);
    app.get("/post/:id",  auth.getPostById);
    app.delete("/post/:id",  auth.deletePost);                         
    app.get('/post', auth.getAllPost);      
    // router.put('/update-images/:postId', updateImages);
    // router.put('/update-video/:postId', updateVideos);

}
// module.exports = router;
