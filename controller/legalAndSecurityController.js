const LegalAndSecurity = require("../database/model/legalandSecurity");

// Add a new legal and security record
exports.addLegalAndSecurity = async (req, res) => {
    try {
        const { title, selectOrder, description, legalAndSecurityType } = req.body;

        if (!title || !legalAndSecurityType) {
            return res.status(400).json({ message: "Title and legalAndSecurityType are required" });
        }

        const newRecord = new LegalAndSecurity({ title, selectOrder, description, legalAndSecurityType });
        await newRecord.save();

        res.status(201).json({ success: true, message: "Record added successfully", data: newRecord });
    } catch (error) {
        console.error("Error adding record:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all records based on legalAndSecurityType
exports.getAllLegalAndSecurity = async (req, res) => {
    try {
        const { legalAndSecurityType } = req.query;

        if (!legalAndSecurityType) {
            return res.status(400).json({ message: "legalAndSecurityType is required" });
        }

        const records = await LegalAndSecurity.find({ legalAndSecurityType });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        console.error("Error fetching records:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get a single record by ID
exports.getOneLegalAndSecurity = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await LegalAndSecurity.findById(id);

        if (!record) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error("Error fetching record:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Edit a legal and security record
exports.editLegalAndSecurity = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, selectOrder, description, legalAndSecurityType } = req.body;

        const record = await LegalAndSecurity.findById(id);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        record.title = title || record.title;
        record.selectOrder = selectOrder || record.selectOrder;
        record.description = description || record.description;
        record.legalAndSecurityType = legalAndSecurityType || record.legalAndSecurityType;

        await record.save();

        res.status(200).json({ success: true, message: "Record updated successfully", data: record });
    } catch (error) {
        console.error("Error updating record:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete a legal and security record
exports.deleteLegalAndSecurity = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRecord = await LegalAndSecurity.findByIdAndDelete(id);

        if (!deletedRecord) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.status(200).json({ success: true, message: "Record deleted successfully" });
    } catch (error) {
        console.error("Error deleting record:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
