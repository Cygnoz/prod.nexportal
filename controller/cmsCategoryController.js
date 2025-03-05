const CmsCategory = require("../database/model/cmsCategory"); // Import the model

// Get all categories based on categoryType
exports.getAllCategories = async (req, res) => {
    try {
        const { categoryType } = req.query; // Get categoryType from query params

        if (!categoryType) {
            return res.status(400).json({ message: "categoryType is required" });
        }

        const categories = await CmsCategory.find({ categoryType });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Add a new category
exports.addCategory = async (req, res) => {
    try {
        const { categoryName, Description, categoryType } = req.body;

        if (!categoryName || !categoryType) {
            return res.status(400).json({ message: "categoryName and categoryType are required" });
        }

        const newCategory = new CmsCategory({ categoryName, Description, categoryType });
        await newCategory.save();

        res.status(201).json({ success: true, message: "Category added successfully", data: newCategory });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Edit a category
exports.editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const updateData = req.body;

        const updatedCategory = await CmsCategory.findByIdAndUpdate(categoryId, updateData, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const deletedCategory = await CmsCategory.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
