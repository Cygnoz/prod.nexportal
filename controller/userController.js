const User = require("../database/model/user"); 
const ActivityLog = require('../database/model/activityLog'); 
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');


exports.addUser = async (req, res,next) => {
  try {
    const { userImage , userName, email, phoneNo, password, role } = req.body;
    // Validate the required fields
    if (!userName ||!email  ||!phoneNo || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if any of the fields (userName, userEmail, userNum) are already in use
    const existingUser = await User.findOne({
      $or: [{ userName }, { email }, { phoneNo }]
    });

    if (existingUser) {
      let message = "Conflict: ";
      if (existingUser.userName === userName) message += "userName already exists. ";
      if (existingUser.email === email) message += "userEmail already exists. ";
      if (existingUser.phoneNo === phoneNo) message += "phone No already exists. ";
      return res.status(400).json({ message: message.trim() });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    let nextId = 1;
    const lastUser = await User.findOne().sort({ _id: -1 }); // Sort by creation date to find the last one
    if (lastUser) {
      const lastId = parseInt(lastUser.employeeId.slice(6));
      console.log(lastId) // Extract the numeric part from the customerID
      nextId = lastId + 1; // Increment the last numeric part
    }    
    const employeeId = `EMPID-${nextId.toString().padStart(4, '0')}`;
  
    

//     const emailSent = await sendCredentialsEmail(email, password, userName, true);
// if (!emailSent) {
//   return res
//     .status(500)
//     .json({ success: false, message: 'Failed to send login credentials email' });
// }


    // Create a new user entry
    const newUser = new User({
      employeeId,
      userImage,
      userName,
      phoneNo,
      email,
      password:hashedPassword,
      role,
    });

    await newUser.save();
   

    


    res.status(201).json({ message: "User added successfully" });
    
    

    if (newUser) {
      logOperation(req, "successfully", newUser._id);
      next();
    }

    // Send the login credentials email
    
    
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};

exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = undefined
    res.status(200).json(user);
     
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
   
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const AllUsers = users.map((history) => {
      const { password, ...rest } = history.toObject(); 
      return rest;
    });

    res.status(200).json({ message: "Users retrieved successfully", AllUsers });
      
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
    
  }
};


exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { userImage, userName, email, phoneNo, role, password } = req.body;

    // Validate input fields
    if (!userName || !email || !phoneNo || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if any fields conflict with existing users (excluding the current user)
    const existingUser = await User.findOne({
      $or: [{ userName }, { email }, { phoneNo }],
      _id: { $ne: userId },
    });

    if (existingUser) {
      let message = "Conflict: ";
      if (existingUser.userName === userName) message += "userName already exists. ";
      if (existingUser.email === email) message += "userEmail already exists. ";
      if (existingUser.phoneNo === phoneNo) message += "phone No already exists. ";
      return res.status(400).json({ message: message.trim() });
    }

    
    // Prepare updated fields
    const updateFields = { userImage, userName, email, phoneNo, role, password };

    // Hash password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;

      // Send email with updated credentials
      // const emailSent = await sendCredentialsEmail(email, password, userName, false);
      // if (!emailSent) {
      //   return res.status(500).json({ success: false, message: 'Failed to send updated password email' });
      // }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });

    // Log operation
    if (updatedUser) {
      logOperation(req, "successfully", updatedUser._id);
      next();
    }

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};


exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });

    // Pass operation details to middleware
    logOperation(req, "successfully");
      next();

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};






exports.getAllActivityLogs = async (req, res) => {
  try {
    // Fetch all activity logs and populate the `userId` field
    const logs = await ActivityLog.find({})
      .populate('userId', 'userName role') 
      .exec();

    // Return the logs in the response
    res.status(200).json({ message: 'Activity logs retrieved successfully', logs });
  } catch (error) {
    console.error('Error retrieving activity logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logOperation = (req, status, operationId = null) => {
  const { id, userName } = req.user;
  const log = { id, userName, status };

  if (operationId) {
    log.operationId = operationId;
  }

  req.user = log;
};



// Create a reusable transporter object using AWS SES
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // Use true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Skip TLS certificate validation (optional)
  },
});





const sendCredentialsEmail = async (email, password, userName, isNew = true) => {
  const subject = isNew
    ? 'Your NexPortal Login Credentials'
    : 'Your NexPortal Password Has Been Updated';

  const text = isNew
    ? `Dear ${userName},

Welcome to NexPortal – Sales & Support System.

Your account has been successfully created. Below are your login credentials:
  
Email: ${email}  
Password: ${password}  

Please note: These credentials are confidential. Do not share them with anyone.

To get started, log in to your account at:  
https://dev.nexportal.billbizz.cloud/  

If you have any questions or need assistance, please contact our support team.

Best regards,  
`
    : `Dear ${userName},

Your NexPortal password has been successfully updated.

Here are your updated login credentials:

Email: ${email}  
Password: ${password}  

Please note: These credentials are confidential. Do not share them with anyone.

Log in to your account at:  
https://dev.nexportal.billbizz.cloud/  

If you did not request this change, please contact our support team immediately.

Best regards,  
`;

  const mailOptions = {
    from: `"NexPortal" <${process.env.EMAIL}>`,
    to: email,
    subject,
    text,
  };


  try {
    await transporter.sendMail(mailOptions);
    console.log('Credentials email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending credentials email:', error);
    return false;
  }
};

// The CygnoNex Team  
// NexPortal  
// Support: notify@cygnonex.com
