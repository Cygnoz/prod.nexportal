const CmsCategory = require("../database/model/cmsCategory");

// Function to clean category data
function cleanCategoryData(data) {
    const cleanData = (value) =>
        value === null || value === undefined || value === "" || value === 0 ? undefined : value;
    return Object.keys(data).reduce((acc, key) => {
        acc[key] = cleanData(data[key]);
        return acc;
    }, {});
}

// Add a new category
exports.addCategory = async (req, res) => {
    try {
        const cleanedData = cleanCategoryData(req.body);
        const { project, categoryName, description, categoryType, image, order } = cleanedData;

        if (!categoryName || !categoryType) {
            return res.status(400).json({ message: "categoryName and categoryType are required" });
        }

        // Check if categoryName already exists within the same categoryType
        const existingCategory = await CmsCategory.findOne({ categoryName, categoryType });

        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category name already exists" });
        }

        // Create and save the new category
        const newCategory = new CmsCategory({ project, categoryName, description, categoryType, image, order });
        await newCategory.save();

        res.status(201).json({ success: true, message: "Category added successfully", data: newCategory });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// Get all categories by type and project
exports.getAllCategories = async (req, res) => {
    try {
        const { categoryType, project } = req.query;
        if (!categoryType) {
            return res.status(400).json({ message: "categoryType is required" });
        }
        let filter = { categoryType };
        if (project) {
            filter.project = { $regex: new RegExp(`^${project}$`, "i") }; // Case-insensitive match
        }
        const categories = await CmsCategory.find(filter);
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// Get a single category by ID
exports.getOneCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await CmsCategory.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Edit a category
exports.editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const cleanedData = cleanCategoryData(req.body);
        const { categoryName, description, categoryType, image, order } = cleanedData;

        // Check if category exists
        const category = await CmsCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if the new category name already exists (excluding the current category)
        if (categoryName) {
            const existingCategory = await CmsCategory.findOne({ 
                categoryName, 
                _id: { $ne: categoryId } // Exclude the current category from the check
            });

            if (existingCategory) {
                return res.status(400).json({ success: false, message: "Category name already exists" });
            }
        }

        // Update the category
        category.categoryName = categoryName || category.categoryName;
        category.description = description || category.description;
        category.categoryType = categoryType || category.categoryType;
        category.image = image || category.image;
        category.order = order || category.order;

        await category.save();

        res.status(200).json({ success: true, message: "Category updated successfully", data: category });
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
