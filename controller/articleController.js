const Article = require("../database/model/cmsArticles");
const CmsCategory = require("../database/model/cmsCategory");
const SubCategory = require("../database/model/subCategory");


//  Get all articles with populated category & subCategory
const mongoose = require("mongoose");

exports.getAllArticles = async (req, res) => {
  try {
    const { subCategoryId, project } = req.query;

    const filter = {};
    if (subCategoryId) filter.subCategory = new mongoose.Types.ObjectId(subCategoryId);
    if (project) filter.project = project.trim(); // Ensure clean string comparison

    console.log("Filter:", filter); // Debugging

    const articles = await Article.find(filter)
      .populate("category", "categoryName categoryType")
      .populate("subCategory", "subCategoryName order description");

    if (!articles.length) {
      return res.status(404).json({ success: false, message: "No articles found" });
    }

    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Add Article
exports.addArticle = async (req, res) => {
  try {
    const { project, image, title, articleImage, category, content, subCategory } = req.body;

    if (!title || !category || !subCategory) {
      return res.status(400).json({ message: "Title, category, and subCategory are required" });
    }

    const newArticle = new Article({ project, image, title, articleImage, category, content, subCategory });
    await newArticle.save();

    // Increment article count in category and subCategory
    await Promise.all([
      SubCategory.findByIdAndUpdate(subCategory, { $inc: { articleCount: 1 } }),
      CmsCategory.findByIdAndUpdate(category, { $inc: { articleCount: 1 } })
    ]);

    res.status(201).json({ success: true, message: "Article added successfully", data: newArticle });
  } catch (error) {
    console.error("Error adding article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Edit Article
exports.editArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { project, image, title, articleImage, category, content, subCategory } = req.body;

    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    const updates = { project, image, title, articleImage, category, content, subCategory };

    const categoryChanged = existingArticle.category.toString() !== category.toString();
    const subCategoryChanged = existingArticle.subCategory.toString() !== subCategory.toString();

    const updateOps = [];

    if (categoryChanged) {
      updateOps.push(
        CmsCategory.findByIdAndUpdate(existingArticle.category, { $inc: { articleCount: -1 } }),
        CmsCategory.findByIdAndUpdate(category, { $inc: { articleCount: 1 } })
      );
    }

    if (subCategoryChanged) {
      updateOps.push(
        SubCategory.findByIdAndUpdate(existingArticle.subCategory, { $inc: { articleCount: -1 } }),
        SubCategory.findByIdAndUpdate(subCategory, { $inc: { articleCount: 1 } })
      );
    }

    // Update the article
    await Promise.all(updateOps);
    const updatedArticle = await Article.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({ success: true, message: "Article updated successfully", data: updatedArticle });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Decrease article count in category and subCategory
    await Promise.all([
      SubCategory.findByIdAndUpdate(existingArticle.subCategory, { $inc: { articleCount: -1 } }),
      CmsCategory.findByIdAndUpdate(existingArticle.category, { $inc: { articleCount: -1 } })
    ]);

    await Article.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



// Get one article by ID with populated category & subCategory
exports.getOneArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId)
      .populate({ path: "category", select: "categoryName categoryType" })
      .populate({ path: "subCategory", select: "subCategoryName order description" });

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


//  Edit an article
// Edit Article
exports.editArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { project, image, title, articleImage, category, content, subCategory } = req.body;

    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    const updates = { project, image, title, articleImage, category, content, subCategory };

    const categoryChanged = existingArticle.category.toString() !== category.toString();
    const subCategoryChanged = existingArticle.subCategory.toString() !== subCategory.toString();

    const updateOps = [];

    if (categoryChanged) {
      updateOps.push(
        CmsCategory.findByIdAndUpdate(existingArticle.category, { $inc: { articleCount: -1 } }),
        CmsCategory.findByIdAndUpdate(category, { $inc: { articleCount: 1 } })
      );
    }

    if (subCategoryChanged) {
      updateOps.push(
        SubCategory.findByIdAndUpdate(existingArticle.subCategory, { $inc: { articleCount: -1 } }),
        SubCategory.findByIdAndUpdate(subCategory, { $inc: { articleCount: 1 } })
      );
    }

    // Update the article
    await Promise.all(updateOps);
    const updatedArticle = await Article.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({ success: true, message: "Article updated successfully", data: updatedArticle });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Decrease article count in category and subCategory
    await Promise.all([
      SubCategory.findByIdAndUpdate(existingArticle.subCategory, { $inc: { articleCount: -1 } }),
      CmsCategory.findByIdAndUpdate(existingArticle.category, { $inc: { articleCount: -1 } })
    ]);

    await Article.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
