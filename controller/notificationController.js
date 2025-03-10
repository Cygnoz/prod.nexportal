const mongoose = require("mongoose");
const Notification = require("../database/model/notification");
const Lead = require("../database/model/leads");

// Add a new notification
exports.addNotification = async (req, res) => {
    try {
        const { image, title, licensers, body, date, time, status ,licensertype } = req.body;

        // Convert licensers to ObjectIds to ensure proper referencing
        const licenserIds = licensers.map(id => new mongoose.Types.ObjectId(id));

        const newNotification = new Notification({
            image,
            title,
            licensers: licenserIds,
            body,
            date,
            time,
            status,
            licensertype
        });

        await newNotification.save();
        res.status(201).json({ success: true, message: "Notification added successfully" });
    } catch (error) {
        console.error("Error adding notification:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all notifications with populated licensers
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate("licensers", "customerId firstName email") // Populate only required fields
            .exec();  // Ensure execution

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single notification by ID with populated licensers
exports.getOneNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id)
            .populate("licensers", "customerId firstName email") // Populate required fields
            .exec();

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Error fetching notification:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Edit a notification
exports.editNotification = async (req, res) => {
    try {
        const { image, title, licensers, body, date, time, status } = req.body;
        const { id } = req.params;

        // Convert licensers to ObjectIds
        const licenserIds = licensers.map(id => new mongoose.Types.ObjectId(id));

        const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            {
                image,
                title,
                licensers: licenserIds,
                body,
                date,
                time,
                status
            },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification updated successfully", updatedNotification });
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
