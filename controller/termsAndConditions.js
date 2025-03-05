

const TermsAndCondition = require("../database/model/termsAndConditions");



// Add a new terms and condition
exports.addTermsAndCondition = async (req, res) => {
    try {
        const { termTitle, order, termDescription } = req.body;

        const newTerm = new TermsAndCondition({
            termTitle,
            order,
            termDescription
        });

        await newTerm.save();
        res.status(201).json({ success: true, message: "Term added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all terms and conditions
exports.getAllTermsAndConditions = async (req, res) => {
    try {
        const terms = await TermsAndCondition.find().sort({ order: 1 }); // Sorted by order field
        res.status(200).json({ success: true, terms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Edit a term and condition
exports.editTermsAndCondition = async (req, res) => {
    try {
        const { termTitle, order, termDescription } = req.body;
        const { id } = req.params;

        const updatedTerm = await TermsAndCondition.findByIdAndUpdate(
            id,
            { termTitle, order, termDescription },
            { new: true }
        );

        if (!updatedTerm) {
            return res.status(404).json({ success: false, message: "Term not found" });
        }

        res.status(200).json({ success: true, message: "Term updated successfully", updatedTerm });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get one term and condition by ID
exports.getOneTermsAndCondition = async (req, res) => {
    try {
        const { id } = req.params;
        const term = await TermsAndCondition.findById(id);

        if (!term) {
            return res.status(404).json({ success: false, message: "Term not found" });
        }

        res.status(200).json({ success: true, term });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Delete a term and condition
exports.deleteTermsAndCondition = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTerm = await TermsAndCondition.findByIdAndDelete(id);

        if (!deletedTerm) {
            return res.status(404).json({ success: false, message: "Term not found" });
        }

        res.status(200).json({ success: true, message: "Term deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
