const mongoose = require("mongoose");
const Notification = require("../database/model/notification");
const Lead = require("../database/model/leads");

// Add a new notification
exports.addNotification = async (req, res, next) => {
    try {
        const { project , image, title, licensers, body, date, time, status ,licensertype } = req.body;

        // Convert licensers to ObjectIds to ensure proper referencing
        const licenserIds = licensers.map(id => new mongoose.Types.ObjectId(id));

        const newNotification = new Notification({
            project,
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
        ActivityLog(req, "Successfully", newNotification._id);
        next();
    } catch (error) {
        console.error("Error adding notification:", error);
        res.status(500).json({ success: false, message: error.message });
        ActivityLog(req, "Failed");
        next();
    }
};

// Get all notifications with populated licensers
exports.getAllNotifications = async (req, res) => {
    try {
        const { project } = req.query;
        const filter = project ? { project } : {}; // Filter only if project is provided

        const notifications = await Notification.find(filter)
            .populate("licensers", "customerId firstName email") // Populate only required fields
            .exec();  // Ensure execution

        if (!notifications.length) {
            return res.status(404).json({ success: false, message: "No notifications found" });

        }

        res.status(200).json({ success: true, data: notifications });
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
exports.editNotification = async (req, res, next) => {
    try {
        const { project ,image, title, licensers, body, date, time, status } = req.body;
        const { id } = req.params;

        // Convert licensers to ObjectIds
        const licenserIds = licensers.map(id => new mongoose.Types.ObjectId(id));

        const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            {
                project,
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
        ActivityLog(req, "Successfully", updatedNotification._id);
        next();
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ success: false, message: error.message });
        ActivityLog(req, "Failed");
        next();  
    }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification deleted successfully" });
        ActivityLog(req, "Successfully", deletedNotification._id);
        next();
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ success: false, message: error.message });
        ActivityLog(req, "Failed");
        next();
    }
};


const ActivityLog = (req, status, operationId = null) => {
    const { id, userName } = req.user;
    const log = { id, userName, status };
  
    if (operationId) {
      log.operationId = operationId;
    }
  
    req.user = log;
  };