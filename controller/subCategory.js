const SubCategory = require("../database/model/subCategory");
const Category = require("../database/model/cmsCategory");

// Add a new sub-category
exports.addSubCategory = async (req, res) => {
    try {
        const { image, subCategoryName, order, category, description } = req.body;

        // Check if category exists
        const validCategory = await Category.findById(category);
        if (!validCategory) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        const newSubCategory = new SubCategory({
            image,
            subCategoryName,
            order,
            category,
            description
        });

        await newSubCategory.save();
        res.status(201).json({ success: true, message: "Sub-category added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all sub-categories with populated category
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate("category", "categoryName description"); // Adjust fields as needed

        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Edit a sub-category
exports.editSubCategory = async (req, res) => {
    try {
        const { image, subCategoryName, order, category, description } = req.body;
        const { id } = req.params;

        // Check if category exists
        if (category) {
            const validCategory = await Category.findById(category);
            if (!validCategory) {
                return res.status(400).json({ success: false, message: "Invalid category ID" });
            }
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            id,
            { image, subCategoryName, order, category, description },
            { new: true }
        );

        if (!updatedSubCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found" });
        }

        res.status(200).json({ success: true, message: "Sub-category updated successfully", updatedSubCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a sub-category
exports.deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

        if (!deletedSubCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found" });
        }

        res.status(200).json({ success: true, message: "Sub-category deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
