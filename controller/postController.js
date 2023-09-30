const Post = require('../model/postModel');
const ProfileDb = require('../model/profileModel');
const Category = require('../model/categoryModel');
const { createPostValidation } = require('../validation/postValidation');




exports.createPost = async (req, res) => {
    try {
        const checkProfile = await ProfileDb.findById(req.body.chooseProfile);
        if (!checkProfile) {
            return res.status(404).json({ status: 404, message: 'No Profile found with this Id' });
        }
        const checkCategory = await Category.findById(req.body.choosePostCategory);
        if (!checkCategory) {
            return res.status(404).json({ status: 404, message: 'No checkCategory found with this Id' });
        }
        let video = [];
        let images = [];
        if (req.files['image']) {
            let imagess = req.files['image'];
            for (let i = 0; i < imagess.length; i++) {
                images.push(imagess[i].path)
            }
        }
        if (req.files['video']) {
            let imagess = req.files['video'];
            for (let i = 0; i < imagess.length; i++) {
                video.push(imagess[i].path)
            }
        }
        const data = {
            chooseProfile: req.body.chooseProfile,
            image: images,
            video: video,
            choosePostCategory: req.body.choosePostCategory,
            title: req.body.title,
            description: req.body.description,
        }
        const Data = await Post.create(data);
        return res.status(200).json({ status: 200, message: "Ads is Added ", data: Data })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getPostById = async (req, res) => {
    try {
            const userId = req.params.id;
            const user = await Post.findById(userId);
            if (user) {
                    return res.status(200).json({ message: "Post found successfully", status: 200, data: user, });
            }
            return res.status(404).json({ message: "Post not Found", status: 404, data: {}, });
    } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to retrieve Post" });
    }
};
exports.deletePost = async (req, res) => {
    try {
            const userId = req.params.id;
            const user = await Post.findById(userId);
            if (user) {
                    const user1 = await Post.findByIdAndDelete({ _id: user._id });;
                    if (user1) {
                            return res.status(200).json({ message: "Post delete successfully.", status: 200, data: {}, });
                    }
            } else {
                    return res.status(404).json({ message: "Post not Found", status: 404, data: {}, });
            }
    } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to retrieve Post" });
    }
};
exports.getAllPost = async (req, res) => {
    try {
            const categories = await Post.find();
            if (categories.length > 0) {
                    return res.status(200).json({ status: 200, message: 'Post found successfully', data: categories });
            } else {
                    return res.status(404).json({ status: 404, message: 'Post not found.', data: categories });
            }
    } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch company categories' });
    }
};









// const createPost = async (req, res) => {
//     try {
//         const { chooseProfile, upload, choosePostCategory, title, description } = req.body;

//         const { error } = createPostValidation.validate({
//             chooseProfile,
//             upload,
//             choosePostCategory,
//             title,
//             description,
//         });
//         if (error) {
//             return res.status(400).json({ message: error.details[0].message });
//         }
//         const checkProfile = await ProfileDb.findById(chooseProfile);
//         if (!checkProfile) {
//             return res.status(404).json({ status: 404, message: 'No Profile found with this Id' });
//         }
//         const checkCategory = await Category.findById(choosePostCategory);
//         if (!checkCategory) {
//             return res.status(404).json({ status: 404, message: 'No checkCategory found with this Id' });
//         }

//         const post = new Post({
//             chooseProfile,
//             upload,
//             choosePostCategory,
//             title,
//             description,
//         });

//         await post.save();

//         const populatedPost = await Post.findById(post._id)
//             .populate('chooseProfile')
//             .populate('choosePostCategory');

//         return res.status(201).json({
//             message: 'Post created successfully',
//             post: populatedPost,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Failed to create post' });
//     }
// };


// const updateImages = async (req, res) => {
//     try {
//         await upload(req, res, async (err) => {
//             if (err instanceof multer.MulterError) {
//                 return res.status(500).json({ error: 'Error uploading images', err });
//             } else if (err) {
//                 return res.status(500).json({ error: 'An unknown error occurred', err });
//             }
//             const postId = req.params.postId;
//             const updates = {};
//             if (req.files['image']) {
//                 updates['upload.image'] = req.files['image'][0].path;
//             }
//             const post = await Post.findByIdAndUpdate(postId, { $set: updates }, { new: true });
//             if (!post) {
//                 return res.status(404).json({ status: 404, message: 'Post Id not found' });
//             }
//             return res.status(200).json({ status: 200, message: 'Images updated successfully', user: post });
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Failed to update images' });
//     }
// };


// const updateVideos = async (req, res) => {
//     try {
//         await upload1(req, res, async (err) => {
//             if (err instanceof multer.MulterError) {
//                 return res.status(500).json({ error: 'Error uploading videos', err });
//             } else if (err) {
//                 return res.status(500).json({ error: 'An unknown error occurred', err });
//             }
//             const postId = req.params.postId;
//             const updates = {};
//             if (req.files['video']) {
//                 updates['upload.video'] = req.files['video'][0].path;
//             }
//             const post = await Post.findByIdAndUpdate(postId, { $set: updates }, { new: true });
//             if (!post) {
//                 return res.status(404).json({ status: 404, message: 'post Id not found' });
//             }
//             return res.status(200).json({ status: 200, message: 'Videos updated successfully', user: post });
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Failed to update videos' });
//     }
// };