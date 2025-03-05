const CmsPost = require("../database/model/cmsPosts"); // Import the CmsPost model

// Add a new post
exports.addPost = async (req, res) => {
    try {
        const { title, image, link, postType } = req.body;

        if (!title || !postType) {
            return res.status(400).json({ message: "Title and postType are required" });
        }

        // Check if the title already exists
        const existingPost = await CmsPost.findOne({ title });
        if (existingPost) {
            return res.status(400).json({ success: false, message: "Title already exists" });
        }

        const newPost = new CmsPost({ title, image, link, postType });
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
        const { postType } = req.query; // Get postType from query params

        if (!postType) {
            return res.status(400).json({ message: "postType is required" });
        }

        const posts = await CmsPost.find({ postType });
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Edit a post
exports.editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, image, link, postType } = req.body;

        // Check if the post exists
        const post = await CmsPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the new title already exists (excluding the current post)
        if (title) {
            const existingPost = await CmsPost.findOne({
                title,
                _id: { $ne: postId } // Exclude the current post from the check
            });

            if (existingPost) {
                return res.status(400).json({ success: false, message: "Title already exists" });
            }
        }

        // Update the post
        post.title = title || post.title;
        post.image = image || post.image;
        post.link = link || post.link;
        post.postType = postType || post.postType;

        await post.save();

        res.status(200).json({ success: true, message: "Post updated successfully", data: post });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const deletedPost = await CmsPost.findByIdAndDelete(postId);

        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
