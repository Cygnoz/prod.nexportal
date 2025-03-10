const SubCategory = require("../database/model/subCategory");
const CmsCategory = require("../database/model/cmsCategory"); // Import Category model for reference

// Add a new sub-category
exports.addSubCategory = async (req, res) => {
    try {
        const { image, subCategoryName, order, categoryName, description } = req.body;

        if (!subCategoryName || !categoryName) {
            return res.status(400).json({ message: "subCategoryName and category are required" });
        }

        // Check if category exists
        const existingCategory = await CmsCategory.findById(categoryName);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if subCategoryName already exists within the same category
        const existingSubCategory = await SubCategory.findOne({ subCategoryName, categoryName });
        if (existingSubCategory) {
            return res.status(400).json({ success: false, message: "Sub-category name already exists" });
        }

        const newSubCategory = new SubCategory({ image, subCategoryName, order, categoryName, description });
        await newSubCategory.save();

        res.status(201).json({ success: true, message: "Sub-category added successfully", data: newSubCategory });
    } catch (error) {
        console.error("Error adding sub-category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all sub-categories
exports.getAllSubCategories = async (req, res) => {
    try {
        // Fetch all sub-categories and populate the category field
        const subCategories = await SubCategory.find().populate("categoryName");

        res.status(200).json({ success: true, data: subCategories });
    } catch (error) {
        console.error("Error fetching sub-categories:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get a single sub-category by ID
exports.getOneSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;

        // Fetch the sub-category and populate category details
        const subCategory = await SubCategory.findById(subCategoryId).populate("category", "categoryName categoryType");

        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found" });
        }

        res.status(200).json({ success: true, data: subCategory });
    } catch (error) {
        console.error("Error fetching sub-category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// Edit a sub-category
exports.editSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        const { subCategoryName, image, order, category, description } = req.body;

        // Check if sub-category exists
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ message: "Sub-category not found" });
        }

        // Check if category exists
        if (category) {
            const existingCategory = await CmsCategory.findById(category);
            if (!existingCategory) {
                return res.status(404).json({ message: "Category not found" });
            }
        }

        // Check if the new subCategoryName already exists within the same category (excluding current sub-category)
        if (subCategoryName) {
            const existingSubCategory = await SubCategory.findOne({
                subCategoryName,
                category: category || subCategory.category,
                _id: { $ne: subCategoryId }
            });

            if (existingSubCategory) {
                return res.status(400).json({ success: false, message: "Sub-category name already exists" });
            }
        }

        // Update sub-category
        subCategory.subCategoryName = subCategoryName || subCategory.subCategoryName;
        subCategory.image = image || subCategory.image;
        subCategory.order = order || subCategory.order;
        subCategory.category = category || subCategory.category;
        subCategory.description = description || subCategory.description;

        await subCategory.save();

        res.status(200).json({ success: true, message: "Sub-category updated successfully", data: subCategory });
    } catch (error) {
        console.error("Error updating sub-category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete a sub-category
exports.deleteSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;

        const deletedSubCategory = await SubCategory.findByIdAndDelete(subCategoryId);

        if (!deletedSubCategory) {
            return res.status(404).json({ message: "Sub-category not found" });
        }

        res.status(200).json({ success: true, message: "Sub-category deleted successfully" });
    } catch (error) {
        console.error("Error deleting sub-category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
