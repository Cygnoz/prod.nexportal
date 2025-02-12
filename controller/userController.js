// v1.0
const ActivityLog = require('../database/model/activityLog'); 
const moment = require("moment-timezone");
const Role = require('../database/model/role'); 
const Region = require("../database/model/region");
const Area = require("../database/model/area");
const Bda = require("../database/model/bda");
const User = require('../database/model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const NodeCache = require('node-cache');
const otpCache = new NodeCache({ stdTTL: 180 }); // 180 seconds
const filterByRole = require("../services/filterByRole");
const SupportAgent = require("../database/model/supportAgent");
const Ticket = require("../database/model/ticket");
const Commission = require("../database/model/commission");
const BusinessCard = require("../database/model/businessCard")

// Login 
exports.login =  async (req, res) => {
  try {
    // Get all data
    const { email, password } = req.body;    

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    // Find the user
    const user = await User.findOne({ email:email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found!' });
    }

    // Match the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Password!' });
    }
    // if (password !== user.password) {
    //     return res.status(401).json({ success: false, message: 'Invalid Password!' });
    //   }

    // Generate OTP
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
       const otp ='111111';

    // Store OTP in cache with the email as the key
    otpCache.set(email, otp);

    // Send OTP email
    // const emailSent = await sendOtpEmail(user.email, otp);
    // if (!emailSent) {
    //   return res.status(500).json({ success: false, message: 'Failed to send OTP, please try again' });
    // }

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Verify OTP
exports.verifyOtp =  async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email, otp);

    // Validate input
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Please provide the OTP' });
    }

    // Find the user
    const user = await User.findOne({ email:email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found!' });
    }

    // Get OTP from cache
    const cachedOtp = otpCache.get(email);
    // console.log(`Cached OTP: ${cachedOtp}, Provided OTP: ${otp}`);

    // Check if OTP matches and is not expired
    if (cachedOtp && cachedOtp === otp) {

      
      // Capture IP address and User-Agent during verification
      const requestIP = req.ip || req.connection.remoteAddress; // Get IP address
      const requestUserAgent = req.headers['user-agent']; // Get User-Agent (browser/device info)

      console.log("Request IP :",requestIP);
      console.log("Request User Agent :",requestUserAgent);      

      
      // Create JWT token with user ID and organizationId
      const token = jwt.sign(
        {
          id: user._id,
          organizationId: user.organizationId,
          userName: user.userName,
          ip: requestIP,  // Bind IP address
          userAgent: requestUserAgent,  // Bind User-Agent (browser/device)
          iat: Math.floor(Date.now() / 1000), // issued at time
          nbf: Math.floor(Date.now() / 1000), // token valid from now 
        },
        process.env.JWT_SECRET, // JWT secret from environment variables
        { expiresIn: '12h' }
      );
      
      // Remove sensitive data from response
      user.password = undefined;

      
      
      const query = await filterByRole(user._id);
      const userId = query.toString();

      // Send response with user data (excluding organizationId)
      res.status(200).json({
        success: true,
        token: `Bearer ${token}`, // Prepend "Bearer " to the token
        user: {
          userId,
          id: user._id,
          email: user.email,
          userName: user.userName,
          userImage: user.userImage,
          employeeId: user.employeeId,
          role: user.role,
        },
      });
      const generatedDateTime = generateTimeAndDateForDB(
        "Asia/Kolkata",
        "DD/MM/YY",
        "/"
      );
      const actionTime = generatedDateTime.dateTime;

      const activity = new ActivityLog({
        userId: user._id, // Assuming your User model has a username field
        activity: `${user.userName} logged in successfully .`, // Log the note associated with the permission
        timestamp: actionTime,
        action: "Login",
        screen: "Login",
        status: "allowed"
      });
      await activity.save();

      // Invalidate the OTP after successful verification
      otpCache.del(email);
    } else {
      res.status(401).json({ success: false, message: 'Invalid or expired OTP!' });
    }
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // Find the user
    const id = req.params.id
    const user = await User.findById(id);

console.log(user.userName);

    // Capture IP address and User-Agent during logout
    const requestIP = req.ip || req.connection.remoteAddress;
    const requestUserAgent = req.headers['user-agent'];

    // Log the logout activity
    const generatedDateTime = generateTimeAndDateForDB(
      "Asia/Kolkata",
      "DD/MM/YY",
      "/"
    );
    const actionTime = generatedDateTime.dateTime;

    const activity = new ActivityLog({
      userId: user._id,
      activity: `${user.userName} logged out successfully.`,
      timestamp: actionTime,
      action: "Logout",
      screen: "Logout",
      status: "allowed",
      // ip: requestIP,
      // userAgent: requestUserAgent,
    });

    await activity.save();

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: `${user.userName} logged out successfully`,
    });

  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



function generateTimeAndDateForDB(
  timeZone,
  dateFormat,
  dateSplit,
  baseTime = new Date(),
  timeFormat = "HH:mm:ss",
  timeSplit = ":"
) {
  // Convert the base time to the desired time zone
  const localDate = moment.tz(baseTime, timeZone);

  // Format date and time according to the specified formats
  let formattedDate = localDate.format(dateFormat);

  // Handle date split if specified
  if (dateSplit) {
    // Replace default split characters with specified split characters
    formattedDate = formattedDate.replace(/[-/]/g, dateSplit); // Adjust regex based on your date format separators
  }

  const formattedTime = localDate.format(timeFormat);
  const timeZoneName = localDate.format("z"); // Get time zone abbreviation

  // Combine the formatted date and time with the split characters and time zone
  const dateTime = `${formattedDate} ${formattedTime
    .split(":")
    .join(timeSplit)} (${timeZoneName})`;

  return {
    date: formattedDate,
    time: `${formattedTime} (${timeZoneName})`,
    dateTime: dateTime,
  };
}





// Nodemailer transporter setup using environment variables
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASSWORD,
//   },
// });




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


// Function to send OTP email asynchronously
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"NexPortal" <${process.env.EMAIL}>`,
    to: email,
    subject: 'NexPortal Software OTP',
    text: `Hey there,

Your One-Time Password (OTP) is: ${otp}

This code is valid for 2 minutes. Please use it promptly to ensure secure access.

Thanks for using our service!

Cheers,
BillBizz`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};





// Hardcoded roles data
const roles = [
  {
    roleName: 'Super Admin',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

      //  chat
       { action: "View Chat", note: "View Chat" },

      //  target
       { action: "Add Target", note: "Add Target" },
       { action: "View Target", note: "View Target" },
      { action: "Edit Target", note: "Edit Target" },
      { action: "Delete Target", note: "Delete Target" },

       //  Category
       { action: "Add Category", note: "Add Category" },
       { action: "View Category", note: "View Category" },
      { action: "Edit Category", note: "Edit Category" },
      { action: "Delete Category", note: "Delete Category" },

      //  Expense
      { action: "Add Expense", note: "Add Expense" },
      { action: "View Expense", note: "View Expense" },
     { action: "Edit Expense", note: "Edit Expense" },
     { action: "Delete Expense", note: "Delete Expense" },

     { action: "Generate Payroll", note: "Generate Payroll" },
     { action: "View Payroll", note: "View Payroll" },
     { action: "Edit Payroll", note: "Edit Payroll" },
    ],
  },
  {
    roleName: 'Sales Admin',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

       //  chat
       { action: "View Chat", note: "View Chat" },
      // target
       { action: "Add Target", note: "Add Target" },
       { action: "View Target", note: "View Target" },
      { action: "Edit Target", note: "Edit Target" },
      { action: "Delete Target", note: "Delete Target" },

      //  Category
      { action: "Add Category", note: "Add Category" },
      { action: "View Category", note: "View Category" },
     { action: "Edit Category", note: "Edit Category" },
     { action: "Delete Category", note: "Delete Category" },

     //  Expense
     { action: "Add Expense", note: "Add Expense" },
     { action: "View Expense", note: "View Expense" },
    { action: "Edit Expense", note: "Edit Expense" },
    { action: "Delete Expense", note: "Delete Expense" },

    { action: "Generate Payroll", note: "Generate Payroll" },
    { action: "View Payroll", note: "View Payroll" },
    { action: "Edit Payroll", note: "Edit Payroll" },
    ],
  },
  {
    roleName: 'Support Admin',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

       //  chat
       { action: "View Chat", note: "View Chat" },

       // target
       { action: "Add Target", note: "Add Target" },
       { action: "View Target", note: "View Target" },
      { action: "Edit Target", note: "Edit Target" },
      { action: "Delete Target", note: "Delete Target" },

      //  Category
      { action: "Add Category", note: "Add Category" },
      { action: "View Category", note: "View Category" },
     { action: "Edit Category", note: "Edit Category" },
     { action: "Delete Category", note: "Delete Category" },

     //  Expense
     { action: "Add Expense", note: "Add Expense" },
     { action: "View Expense", note: "View Expense" },
    { action: "Edit Expense", note: "Edit Expense" },
    { action: "Delete Expense", note: "Delete Expense" },

    { action: "Generate Payroll", note: "Generate Payroll" },
    { action: "View Payroll", note: "View Payroll" },
    { action: "Edit Payroll", note: "Edit Payroll" },
    ],
  },
  {
    roleName: 'Region Manager',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

       //  chat
       { action: "View Chat", note: "View Chat" },

       // target
       { action: "Add Target", note: "Add Target" },
       { action: "View Target", note: "View Target" },
      { action: "Edit Target", note: "Edit Target" },
      { action: "Delete Target", note: "Delete Target" },

      //  Category
      { action: "Add Category", note: "Add Category" },
      { action: "View Category", note: "View Category" },
     { action: "Edit Category", note: "Edit Category" },
     { action: "Delete Category", note: "Delete Category" },

     //  Expense
     { action: "Add Expense", note: "Add Expense" },
     { action: "View Expense", note: "View Expense" },
    { action: "Edit Expense", note: "Edit Expense" },
    { action: "Delete Expense", note: "Delete Expense" },
    ],
  },
  {
    roleName: 'Area Manager',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

       //  chat
       { action: "View Chat", note: "View Chat" },
       // target
       { action: "Add Target", note: "Add Target" },
       { action: "View Target", note: "View Target" },
      { action: "Edit Target", note: "Edit Target" },
      { action: "Delete Target", note: "Delete Target" },

      //  Category
      { action: "Add Category", note: "Add Category" },
      { action: "View Category", note: "View Category" },
     { action: "Edit Category", note: "Edit Category" },
     { action: "Delete Category", note: "Delete Category" },

     //  Expense
     { action: "Add Expense", note: "Add Expense" },
     { action: "View Expense", note: "View Expense" },
    { action: "Edit Expense", note: "Edit Expense" },
    { action: "Delete Expense", note: "Delete Expense" },
    ],
  },
  {
    roleName: 'BDA',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

       //  chat
       { action: "View Chat", note: "View Chat" },

       // target
       { action: "View Target", note: "View Target" },

       //  Category
       { action: "Add Category", note: "Add Category" },
       { action: "View Category", note: "View Category" },
      { action: "Edit Category", note: "Edit Category" },
      { action: "Delete Category", note: "Delete Category" },

      //  Expense
      { action: "Add Expense", note: "Add Expense" },
      { action: "View Expense", note: "View Expense" },
     { action: "Edit Expense", note: "Edit Expense" },
     { action: "Delete Expense", note: "Delete Expense" },
    ],
  },
  {
    roleName: 'Supervisor',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

       //  chat
       { action: "View Chat", note: "View Chat" },

       //  Category
       { action: "Add Category", note: "Add Category" },
       { action: "View Category", note: "View Category" },
      { action: "Edit Category", note: "Edit Category" },
      { action: "Delete Category", note: "Delete Category" },

      //  Expense
      { action: "Add Expense", note: "Add Expense" },
      { action: "View Expense", note: "View Expense" },
     { action: "Edit Expense", note: "Edit Expense" },
     { action: "Delete Expense", note: "Delete Expense" },
    ],
  },
  {
    roleName: 'Support Agent',
    permissions: [
      // User
      { action: "Add User", note: "Add User" },
      { action: "View User", note: "View User" },
      { action: "Edit User", note: "Edit User" },
      { action: "Delete User", note: "Delete User" },

      // Activity log
      { action: "View logs", note: "View logs" },

      // Region
      { action: "Add Region", note: "Add Region" },
      { action: "View Region", note: "View Region" },
      { action: "Edit Region", note: "Edit Region" },
      { action: "Delete Region", note: "Delete Region" },
      { action: "Deactivate Region", note: "Deactivate Region" },

      // Area
      { action: "Add Area", note: "Add Area" },
      { action: "View Area", note: "View Area" },
      { action: "Edit Area", note: "Edit Area" },
      { action: "Delete Area", note: "Delete Area" },
      { action: "Deactivate Area", note: "Deactivate Area" },

      // Region Manager
      { action: "Add Region Manager", note: "Add Region Manager" },
      { action: "View Region Manager", note: "View Region Manager" },
      { action: "Edit Region Manager", note: "Edit Region Manager" },
      { action: "Delete Region Manager", note: "Delete Region Manager" },
      { action: "Deactivate Region Manager", note: "Deactivate Region Manager" },

      // Area Manager
      { action: "Add Area Manager", note: "Add Area Manager" },
      { action: "View Area Manager", note: "View Area Manager" },
      { action: "Edit Area Manager", note: "Edit Area Manager" },
      { action: "Delete Area Manager", note: "Delete Area Manager" },
      { action: "Deactivate Area Manager", note: "Deactivate Area Manager" },

      // BDA
      { action: "Add BDA", note: "Add BDA" },
      { action: "View BDA", note: "View BDA" },
      { action: "Edit BDA", note: "Edit BDA" },
      { action: "Delete BDA", note: "Delete BDA" },
      { action: "Deactivate BDA", note: "Deactivate BDA" },

      // commission
      { action: "Add Commission", note: "Add Commission" },
      { action: "View Commission", note: "View Commission" },
      { action: "Edit Commission", note: "Edit Commission" },
      { action: "Delete Commission", note: "Delete Commission" },

      // Supervisor
      { action: "Add Supervisor", note: "Add Supervisor" },
      { action: "View Supervisor", note: "View Supervisor" },
      { action: "Edit Supervisor", note: "Edit Supervisor" },
      { action: "Delete Supervisor", note: "Delete Supervisor" },
      { action: "Deactivate Supervisor", note: "Deactivate Supervisor" },
      
      // Support Agent
      { action: "Add Support Agent", note: "Add Support Agent" },
      { action: "View Support Agent", note: "View Support Agent" },
      { action: "Edit Support Agent", note: "Edit Support Agent" },
      { action: "Delete Support Agent", note: "Delete Support Agent" },
      { action: "Deactivate Support Agent", note: "Deactivate Support Agent" },

      // Lead
      { action: "Add Lead", note: "Add Lead" },
      { action: "View Lead", note: "View Lead" },
      { action: "Edit Lead", note: "Edit Lead" },
      { action: "Delete Lead", note: "Delete Lead" },

      // Trial
      { action: "Convert Trial", note: "Convert Trial" },
      { action: "View Trial", note: "View Trial" },
      { action: "Extend Trial", note: "Extend Trial" },
      { action: "Delete Trial", note: "Delete Trial" },
      { action: "Convert Licenser", note: "Convert Licenser" },
      { action: "Hold Trial", note: "Hold Trial" },
      { action: "Resume Trial", note: "Resume Trial" },

      // licenser
      { action: "Add Licenser", note: "Add Licenser" },
      { action: "View Licenser", note: "View Licenser" },
      { action: "Edit Licenser", note: "Edit Licenser" },
      { action: "Delete Licenser", note: "Delete Licenser" },
      { action: "Renew Licenser", note: "Renew Licenser" },
      
      // Tickets
      { action: "Add Ticket", note: "Add Ticket" },
      { action: "View Ticket", note: "View Ticket" },
      { action: "Edit Ticket", note: "Edit Ticket" },
      { action: "Delete Ticket", note: "Delete Ticket" },
      
       // Praise
       { action: "Add Praise", note: "Add Praise" },
       { action: "View Praise", note: "View Praise" },
       { action: "Edit Praise", note: "Edit Praise" },
       { action: "Delete Praise", note: "Delete Praise" },
      
       // Activity
       { action: "Add Activity", note: "Add Activity" },
       { action: "View Activity", note: "View Activity" },
       { action: "Edit Activity", note: "Edit Activity" },
       { action: "Delete Activity", note: "Delete Activity" },

       //  chat
       { action: "View Chat", note: "View Chat" },

       //  Category
       { action: "Add Category", note: "Add Category" },
       { action: "View Category", note: "View Category" },
      { action: "Edit Category", note: "Edit Category" },
      { action: "Delete Category", note: "Delete Category" },

      //  Expense
      { action: "Add Expense", note: "Add Expense" },
      { action: "View Expense", note: "View Expense" },
     { action: "Edit Expense", note: "Edit Expense" },
     { action: "Delete Expense", note: "Delete Expense" },
    ],
  }
];

exports.getRegionsAreasBdas = async (req, res) => {
  try {
    // Fetch active regions
    const regions = await Region.find({ status: "Active" })
      .select("_id regionName");

    // Fetch active areas
    const areas = await Area.find({ status: "Active" })
      .select("_id areaName region");

    // Fetch active BDAs and populate the user field to get userName
    const bdas = await Bda.find({ status: "Active" })
      .populate({
        path: 'user',
        model: User,
        select: 'userName'
      })
      .select("_id user area region");

    // Format BDAs to include userName directly
    const formattedBdas = bdas.map(bda => ({
      _id: bda._id,
      area: bda.area,
      region: bda.region,
      userName: bda.user?.userName || 'N/A'
    }));

    // Fetch active Support Agents
    const supportagents = await SupportAgent.find({ status: "Active" })
      .populate({
        path: 'user',
        model: User,
        select: 'userName'
      })
      .select("_id user region");

    // Fetch unsolved tickets count for each support agent
    const formattedSupport = await Promise.all(supportagents.map(async (supportAgent) => {
      const unsolvedTicketsCount = await Ticket.countDocuments({
        supportAgentId: supportAgent._id,
        status: { $ne: "Resolved" }
      });

      return {
        _id: supportAgent._id,
        region: supportAgent.region,
        userName: supportAgent.user?.userName || 'N/A',
        unsolvedTickets: unsolvedTicketsCount
      };
    }));

    // Fetch commissions
    const commissions = await Commission.find({}).select("_id profileName");

    // Send the response
    res.status(200).json({
      regions,
      areas,
      bdas: formattedBdas,
      supportAgents: formattedSupport,
      commissions
    });
  } catch (error) {
    console.error('Error fetching regions, areas, and BDAs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getCountriesData = (req, res) => {
  try {
    const countriesData = [
      {
        countries: [
          {
            name: "India",
            states: ["Andaman and Nicobar Island", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"],
            // phoneNumberCode: "+91",
            // flag:"https://flagicons.lipis.dev/flags/1x1/in.svg",
            // phoneNumberLimit:10,
            // taxType:"GST"
          },
          {
            name: "Saudi Arabia",
            states: ["Asir","Al Bahah", "Al Jawf", "Al-Qassim", "Eastern Province", "Hail", "Jazan", "Makkah","Medina", "Najran", "Northern Borders", "Riyadh", "Tabuk"],
            // phoneNumberCode: "+966",
            // flag:"https://flagicons.lipis.dev/flags/1x1/sa.svg",
            // phoneNumberLimit:9,
            // taxType:"VAT"
          },
          {
            name: "United Arab Emirates",
            states: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al-Quwain", "Fujairah", "Ras Al Khaimah"],
            // phoneNumberCode: "+971",
            // flag:"https://flagicons.lipis.dev/flags/1x1/ae.svg",
            // phoneNumberLimit:9,
            // taxType:"VAT"
          },
        ]
      }
    ];
    if (countriesData.length > 0) {
      res.status(200).json(countriesData);
    } else {
      res.status(404).json("No Additional Data found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
};



// Controller function to add or update roles
exports.addOrUpdateRoles = async (req, res) => {
  try {
    for (const roleData of roles) {
      // Update the role if it exists, or insert a new one
      await Role.updateOne(
        { roleName: roleData.roleName }, // Find by roleName
        { $set: { permissions: roleData.permissions } }, // Update permissions
        { upsert: true } // Insert the role if it doesn't exist
      );
    }
    // Return success response
    res.status(200).json({ message: 'Roles have been added or updated successfully.' });
  } catch (error) {
    console.error('Error adding or updating roles:', error);
    // Return error response
    res.status(500).json({ message: 'Internal server error' });
  }
};


// PUT function to add or edit business card fields
exports.updateBusinessCard = async (req, res) => {
  try {
    const updates = req.body;

    // Validate request body
    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Update the first document or create a new one if none exists
    const updatedCard = await BusinessCard.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true } // `upsert: true` creates the document if it doesn't exist
    );
    const generatedDateTime = generateTimeAndDateForDB(
      "Asia/Kolkata",
      "DD/MM/YY",
      "/"
    );
    const actionTime = generatedDateTime.dateTime;

     // Log the operation
        const activity = new ActivityLog({
          userId: req.user.id,
          operationId: updatedCard._id,
          activity: `${req.user.userName} successfully Updated Business card settings.`,
          timestamp: actionTime,
          action: "Update",
          status: "Succesfully",
          screen: "Business card",
        });
        await activity.save();

    res.status(200).json({
      message: "Business card updated successfully",
      businessCard: updatedCard,
    });
  } catch (error) {
    console.error("Error updating business card:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBusinessCard = async (req, res) => {
  try {
    // Find the first business card document
    const businessCard = await BusinessCard.findOne({});

    if (!businessCard) {
      return res.status(404).json({
        message: "Business card settings not found",
      });
    }

    res.status(200).json({
      message: "Business card settings retrieved successfully",
      businessCard,
    });
  } catch (error) {
    console.error("Error retrieving business card settings:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
