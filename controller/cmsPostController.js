const CmsPost = require("../database/model/cmsPosts");
const CmsCategory = require("../database/model/cmsCategory"); // Import CmsCategory model

// Add a new post
exports.addPost = async (req, res) => {
    try {
        const { title, image, link, postType, content, category, createdBy } = req.body;

        if (!title || !postType || !category) {
            return res.status(400).json({ message: "Title, postType, and category are required" });
        }

        // Create a new post
        const newPost = new CmsPost({ title, image, link, postType, content, category, createdBy });
        await newPost.save();

        // Increment postCount in the category
        await CmsCategory.findByIdAndUpdate(category, { $inc: { postCount: 1 } });

        res.status(201).json({ success: true, data: newPost, message: "Post created successfully" });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.getAllPosts = async (req, res) => {
    try {
        const { postType } = req.query;

        if (!postType) {
            return res.status(400).json({ message: "postType is required" });
        }

        const posts = await CmsPost.find({ postType })
            .populate({
                path: "category",
                select: "categoryName categoryType postCount" // Include postCount
            })
            .select("title image link postType content createdBy category createdAt updatedAt");

        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// Get a single post by ID
exports.getOnePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Fetch the post and populate category details
        const post = await CmsPost.findById(postId).populate("category", "categoryName categoryType");

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



// Edit a post
exports.editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, image, link, postType, category } = req.body;

        // Check if the post exists
        const post = await CmsPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // // Check if the new title already exists (excluding the current post)
        // if (title) {
        //     const existingPost = await CmsPost.findOne({
        //         title,
        //         _id: { $ne: postId } // Exclude the current post from the check
        //     });

        //     if (existingPost) {
        //         return res.status(400).json({ success: false, message: "Title already exists" });
        //     }
        // }

        // Validate category if provided
        if (category) {
            const categoryExists = await CmsCategory.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ success: false, message: "Invalid category ID" });
            }
        }

        // Update the post
        post.title = title || post.title;
        post.image = image || post.image;
        post.link = link || post.link;
        post.postType = postType || post.postType;
        post.category = category || post.category;

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

        const post = await CmsPost.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Delete the post
        await CmsPost.findByIdAndDelete(postId);

        // Decrement postCount in the category
        await CmsCategory.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

