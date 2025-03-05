const Notification = require("../database/model/notification");
const Lead = require("../database/model/leads");

// Add a new notification
exports.addNotification = async (req, res) => {
    try {
        const { image, title, licensers, body, date, time, status } = req.body;

        // Filter licensers with customerStatus: 'licenser'
        const validLicensers = await Lead.find({ _id: { $in: licensers }, customerStatus: "licenser" }).select("_id");

        const newNotification = new Notification({
            image,
            title,
            licensers: validLicensers.map(l => l._id),
            body,
            date,
            time,
            status
        });

        await newNotification.save();
        res.status(201).json({ success: true, message: "Notification added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all notifications with populated licensers
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate({
            path: "licensers",
            match: { customerStatus: "licenser" },
            select: "customerId name email" // Adjust fields as needed
        });

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Edit a notification
exports.editNotification = async (req, res) => {
    try {
        const { image, title, licensers, body, date, time, status } = req.body;
        const { id } = req.params;

        // Filter licensers with customerStatus: 'licenser'
        const validLicensers = await Lead.find({ _id: { $in: licensers }, customerStatus: "licenser" }).select("_id");

        const updatedNotification = await Notification.findByIdAndUpdate(id, {
            image,
            title,
            licensers: validLicensers.map(l => l._id),
            body,
            date,
            time,
            status
        }, { new: true });

        if (!updatedNotification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification updated successfully", updatedNotification });
    } catch (error) {
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
        res.status(500).json({ success: false, message: error.message });
    }
};
