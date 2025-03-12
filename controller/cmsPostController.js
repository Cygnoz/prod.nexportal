const CmsPost = require("../database/model/cmsPosts");
const CmsCategory = require("../database/model/cmsCategory"); // Import CmsCategory model
const User = require("../database/model/user"); 

// Add a new post

// Function to clean post data
function cleanPostData(data) {
    const cleanData = (value) =>
      value === null || value === undefined || value === "" ? undefined : value;
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = cleanData(data[key]);
      return acc;
    }, {});
  }
  
  // Add a new post
  exports.addPost = async (req, res) => {
    try {
        let cleanedData = cleanPostData(req.body);

        if (!cleanedData.title || !cleanedData.postType || !cleanedData.category) {
            return res.status(400).json({ message: "Title, postType, and category are required" });
        }

        // Ensure image is always an array
        if (typeof cleanedData.image === "string") {
            cleanedData.image = [cleanedData.image];
        } else if (!Array.isArray(cleanedData.image)) {
            cleanedData.image = [];
        }

        // Add createdBy details
        cleanedData.createdBy = {
            userId: req.user.id,
            userName: req.user.userName,
            userImage: req.user.userImage,
        };

        // Create and save the post
        const newPost = new CmsPost(cleanedData);
        await newPost.save();

        // Increment postCount in the category
        await CmsCategory.findByIdAndUpdate(cleanedData.category, { $inc: { postCount: 1 } });

        res.status(201).json({ success: true, data: newPost, message: "Post created successfully" });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getAllPosts = async (req, res) => {
  try {
      const { postType, project } = req.query;

      if (!postType ) {
          return res.status(400).json({ success: false, message: "postType are required" });
      }

      // Ensure case-insensitive search for postType and project
      const posts = await CmsPost.find({ 
          postType: { $regex: new RegExp(`^${postType}$`, "i") },
          project: { $regex: new RegExp(`^${project}$`, "i") }
      })
      .populate({
          path: "category",
          select: "categoryName categoryType"
      })
      .populate({
          path: "createdBy.userId",
          select: "userImage"
      });

      if (!posts.length) {
          return res.status(404).json({ success: false, message: "No posts found" });
      }

      // Ensure createdBy.userId exists before accessing _id and userImage
      const formattedPosts = posts.map(post => ({
          ...post._doc,
          createdBy: {
              userId: post.createdBy?.userId?._id || null,
              userName: post.createdBy?.userName || "Unknown",
              userImage: post.createdBy?.userId?.userImage || null
          }
      }));

      res.status(200).json({ success: true, data: formattedPosts });
  } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
};




exports.getAllAuthors = async (req, res) => {
    try {
      // Fetch all users with role "Author"
      const authors = await User.find({ role: "Author" });
  
      if (!authors || authors.length === 0) {
        return res.status(404).json({ message: "No authors found" });
      }
  
      const formattedAuthors = authors.map((author) => {
        const { password, ...rest } = author.toObject();
        return rest;
      });
  
      res.status(200).json({ message: "Authors retrieved successfully", authors: formattedAuthors });
    } catch (error) {
      console.error("Error fetching authors:", error);
      res.status(500).json({ message: "Internal server error" });
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
      let cleanedData = cleanPostData(req.body);
      const { category, image } = cleanedData;

      // Check if the post exists
      const post = await CmsPost.findById(postId);
      if (!post) {
          return res.status(404).json({ success: false, message: "Post not found" });
      }

      // Validate category if provided
      if (category) {
          const categoryExists = await CmsCategory.findById(category);
          if (!categoryExists) {
              return res.status(400).json({ success: false, message: "Invalid category ID" });
          }
      }

      // Ensure image is an array if provided
      if (typeof image === "string") {
          cleanedData.image = [image];
      } else if (!Array.isArray(image)) {
          cleanedData.image = post.image; // Keep existing images if no valid input is provided
      }

      // Update the post
      const updatedPost = await CmsPost.findByIdAndUpdate(
          postId,
          { $set: cleanedData },
          { new: true, runValidators: true }
      );

      res.status(200).json({ success: true, message: "Post updated successfully", data: updatedPost });
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

