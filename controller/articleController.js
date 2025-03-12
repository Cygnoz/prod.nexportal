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




exports.addArticle = async (req, res) => {
  try {
    const { project ,image, title, articleImage ,  category, content, subCategory } = req.body;

    if (!title || !category || !subCategory) {
      return res.status(400).json({ message: "Title, category, and subCategory are required" });
    }

    // Create and save the new article
    const newArticle = new Article({ project , image, title, articleImage, category, content ,subCategory });
    await newArticle.save();

    // Increment article count in subCategory
    await SubCategory.findByIdAndUpdate(subCategory, { $inc: { articleCount: 1 } });

    // Increment article count in category
    await CmsCategory.findByIdAndUpdate(category, { $inc: { articleCount: 1 } });

    res.status(201).json({ success: true, message: "Article added successfully", data: newArticle });
  } catch (error) {
    console.error("Error adding article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};//  Add a new article



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
exports.editArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const updateData = req.body;

    const updatedArticle = await Article.findByIdAndUpdate(articleId, updateData, { new: true })
      .populate({ path: "category", select: "categoryName categoryType" })
      .populate({ path: "subCategory", select: "subCategoryName order description" });

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ success: true, message: "Article updated successfully", data: updatedArticle });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//  Delete an article
exports.deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const deletedArticle = await Article.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


