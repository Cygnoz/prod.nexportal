const mongoose = require("mongoose");
const CmsPost = require("../database/model/cmsPosts"); // Adjusted path for the model

// Add a new post with GridFS file upload
exports.addPost = async (req, res) => {
    try {
        const { title, postType } = req.body;
        
        if (!title || !postType) {
            return res.status(400).json({ message: "Title and postType are required" });
        }

        console.log(req.file)

        // if (!req.file) {
        //     return res.status(400).json({ message: "Image file is required" });
        // }

        // GridFS automatically assigns an `_id`, which we store as `image`
        const newPost = new CmsPost({
            title,
            image: req.file.filename, // Storing the GridFS file ID
            postType
        });


        await newPost.save();
        res.status(201).json({ success: true, message: "Post added successfully", data: newPost });
    } catch (error) {
        console.error("Error adding post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all posts based on postType
exports.getAllPosts = async (req, res) => {
    try {
        const { postType } = req.query;

        if (!postType) {
            return res.status(400).json({ message: "postType is required" });
        }

        const posts = await CmsPost.find({ postType });

        // Format response with full image URL
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            postType: post.postType,
            image: post.image ? `${process.env.DOMAIN}/uploads/${post.image}` : null,
        }));

        res.status(200).json({ success: true, data: formattedPosts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// Get a specific post along with its image
exports.getPostWithImage = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await CmsPost.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Fetch the image from GridFS
        const file = bucket.openDownloadStream(new mongoose.Types.ObjectId(post.image));
        res.set("Content-Type", "image/png"); // Adjust MIME type based on your uploads
        file.pipe(res);
    } catch (error) {
        console.error("Error retrieving post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Edit a post
exports.editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const updateData = req.body;

        if (req.file) {
            updateData.image = req.file.id; // Update image in case of a new upload
        }

        const updatedPost = await CmsPost.findByIdAndUpdate(postId, updateData, { new: true });

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ success: true, message: "Post updated successfully", data: updatedPost });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete a post (including the GridFS image)
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await CmsPost.findByIdAndDelete(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Delete the file from GridFS
        await bucket.delete(new mongoose.Types.ObjectId(post.image));

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
