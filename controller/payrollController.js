const mongoose = require("mongoose");
const moment = require("moment");
const Payroll = require("../database/model/payroll");
const RegionManager = require("../database/model/regionManager");
const AreaManager = require("../database/model/areaManager");
const Bda = require("../database/model/bda");
const Supervisor = require("../database/model/supervisor");
const SupportAgent = require("../database/model/supportAgent");
const Leads = require("../database/model/leads");
const ActivityLog = require("../database/model/activityLog");
const User = require("../database/model/user");
const RenewalLicenser = require("../database/model/renewLicenser");




exports.generatePayroll = async (req, res , next) => {
  try {
    const { month, year } = req.body;
    const userId = req.user.id;
    const payrollMonth = `${year}-${month}`;

    const startDate = moment(`${payrollMonth}-01`).startOf("month").format("YYYY-MM-DD HH:mm:ss");
    const endDate = moment(`${payrollMonth}-01`).endOf("month").format("YYYY-MM-DD HH:mm:ss");

    // Check if payroll already exists for this month
    const existingPayroll = await Payroll.find({ month: payrollMonth });
    if (existingPayroll.length > 0) {
      return res.status(200).json({ message: "Payroll already generated for this month." });
    }

    // Define staff roles & models
    const staffRoles = [
      { model: RegionManager, role: "regionManager", hasCommission: true ,schema: "RegionManager" },
      { model: AreaManager, role: "areaManager", hasCommission: true,schema: "AreaManager" },
      { model: Bda, role: "bdaId", hasCommission: true,schema: "Bda" },
      { model: Supervisor, role: "supervisor", hasCommission: false,schema: "Supervisor" },
      { model: SupportAgent, role: "supportAgent", hasCommission: false,schema: "SupportAgent" },
    ];

    const payrollEntries = [];
    let nextId = 1;
    const lastPayroll = await Payroll.findOne().sort({ _id: -1 });
    if (lastPayroll) {
      const lastId = parseInt(lastPayroll.payRollId.slice(8));
      nextId = lastId + 1;
    }

    for (const { model, role, hasCommission , schema } of staffRoles) {
      // Fetch only staff who joined ON or BEFORE the payrollMonth
      const staffList = await model.find({
        status: "Active",
        dateOfJoining: { $lte: endDate } // Ensure staff joined on or before the month
      }).populate({
        path: "commission",
        select: "commissionPoint recurringPoint perPointValue thresholdLicense",
      });

      for (const staff of staffList) {
        const { _id, dateOfJoining, salaryAmount, commission  } = staff;
        
        
        const joiningMonthYear = moment(dateOfJoining).format("YYYY-MM");

        // Skip staff if payrollMonth is before their joining month
        if (joiningMonthYear > payrollMonth) {
          continue;
        }

        let adjustedSalary = salaryAmount;

        // If the staff joined within the payroll month, calculate partial salary
        if (joiningMonthYear === payrollMonth) {
          const joiningDate = moment(dateOfJoining);
          const payrollDate = moment(`${year}-${month}-01`);
          const endOfMonth = payrollDate.clone().endOf("month");
          let workingDays = 0;
          for (let d = joiningDate.clone(); d.isBefore(endOfMonth); d.add(1, "days")) {
            if (d.isoWeekday() !== 6 && d.isoWeekday() !== 7) {
              workingDays++;
            }
          }

          const perDaySalary = salaryAmount / 22;
          adjustedSalary = Number((perDaySalary * workingDays).toFixed(0));
        }

        let newLicenseEarnings = 0,
          recuringAmount = 0,
          totalLicenses = 0,
          recurringLicenses = 0;

        if (hasCommission && commission) {
          totalLicenses = await Leads.countDocuments({
            [role]: _id,
            customerStatus: "Licenser",
            licensorDate: { $gte: startDate, $lt: endDate },
          });
          
          recurringLicenses = await Leads.countDocuments({
            [role]: _id,
            customerStatus: "Licenser",
            renewalDate: { $gte: startDate, $lt: endDate },
          });

          
          
          if (totalLicenses >= commission.thresholdLicense) {
            const newLicenses = totalLicenses - commission.thresholdLicense;
            const licenseCommissionPoint = newLicenses * commission.commissionPoint;
            newLicenseEarnings = licenseCommissionPoint * commission.perPointValue;

            const renewalCommissionPoint = recurringLicenses * commission.recurringPoint;
            recuringAmount = renewalCommissionPoint * commission.perPointValue;
          }
        }

        const totalSalary = hasCommission
          ? Number((adjustedSalary + newLicenseEarnings + recuringAmount).toFixed(0))
          : adjustedSalary;

        const existingPayrollEntry = await Payroll.findOne({
          staffId: _id,
          month: payrollMonth,
        });

        const payRollId = `PAYROLL-${nextId.toString().padStart(4, "0")}`;
        nextId++;


        if (!existingPayrollEntry) {
          payrollEntries.push({
            staffId: _id,
            staffType: schema,
            payRollId,
            payRollStatus: "Pending Generation",
            basicSalary: adjustedSalary,
            commissionProfile: hasCommission && commission ? commission._id : null,
            totalLicenses,
            recurringLicenses,
            newLicenseEarnings,
            recuringAmount,
            totalSalary,
            TravelAllowance: 0,
            comments: "",
            month: payrollMonth,
            generatedBy: userId,
          });
        }
      }
    }

    if (payrollEntries.length > 0) {
      await Payroll.insertMany(payrollEntries);
    }

    res.status(200).json({
      message: "Payroll generated successfully.",
      entries: payrollEntries,
    });
    logOperation(req, "successfully");
      next();
  } catch (error) {
    console.error("Error generating payroll:", error.message);
    res.status(500).json({ message: error.message });
  }
};




exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, year } = req.params; // Extract month and year from params
    const payrollMonth = `${year}-${month}`;

    const payrolls = await Payroll.find({
      month: payrollMonth
    }).populate({
      path: "staffId",
      select: "user",
      populate: { path: "user", select: "userName role " }
    });

    if (payrolls.length === 0) {
      return res.status(404).json({ message: "Payroll not generated for this month." });
    }

    res.status(200).json(payrolls);
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





exports.getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id)
    .populate({
      path: "staffId",
      select: "user dateOfJoining", // Only include `user` in staffId
      populate: { path: "user", select: "userName employeeId role userImage" } // Nested population, only `userName` and `role`
    })
  
      .populate("commissionProfile", "profileName commissionPoint recurringPoint thresholdLicense")
      .populate("approvedBy", "userName")
      .populate("generatedBy", "userName"); // Ensure generatedBy exists in schema

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    res.status(200).json(payroll);
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { payRollStatus, ...data } = req.body; // Extract payslipStatus separately
    const generatedDateTime = generateTimeAndDateForDB(
      "Asia/Kolkata",
      "DD/MM/YY",
      "/"
    );
    const actionTime = generatedDateTime.dateTime;

    const updateFields = { ...data };
    let action = "Edit"; // Default action

    if (payRollStatus) {
      if (payRollStatus === "Approval Granted") {
        updateFields.payRollStatus = "Approval Granted";
        updateFields.approvalDate = actionTime;
        updateFields.approvedBy = userId;
        action = "Approved";
      } else {
        updateFields.payRollStatus = "Awaiting Approval";
      }
    }

    // Update the payroll document
    const payroll = await Payroll.findByIdAndUpdate(
      id,
      { ...updateFields },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    // Log activity
    const activity = new ActivityLog({
      userId: req.user.id,
      operationId: id,
      activity: `${req.user.userName} Successfully ${action} Payroll.`,
      timestamp: actionTime,
      action: action,
      status: "Successfully",
      screen: "Payroll",
    });
    await activity.save();

    res.status(200).json({ message: "Payroll updated successfully", payroll });
  } catch (error) {
    console.error("Error updating payroll:", error);

    // Log failure activity
    const failActivity = new ActivityLog({
      userId: req.user.id,
      operationId: req.params.id,
      activity: `${req.user.userName} Failed to update Payroll.`,
      timestamp: actionTime,
      action: "Update",
      status: "Failed",
      screen: "Payroll",
    });
    await failActivity.save();

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.payPayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, ...data } = req.body; // Extract status separately
    const actionDate = new Date().toISOString(); // Capture current date-time

    const updateFields = { ...data, payRollStatus: "Paid" };

    //  const requestBody = {
    //       organizationId: process.env.ORGANIZATION_ID,
    //       expenseCategory: categoryName,
    //       description: description,
    //     };
    //     // Generate JWT token
    //     const token = jwt.sign(
    //       {
    //         organizationId: process.env.ORGANIZATION_ID,
    //       },
    //       process.env.NEX_JWT_SECRET,
    //       { expiresIn: "12h" }
    //     );
    //     // https://billbizzapi.azure-api.net/staff/add-category-nexportal
    //     // API call to external service
    //     const response = await axios.post(
    //       "https://billbizzapi.azure-api.net/staff/add-category-nexportal",
    //       requestBody, // <-- requestBody should be passed as the second argument (data)
    //       {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );

    // const allAccounts = response.data;


    // Update the expense with new values
    const payroll = await Payroll.findByIdAndUpdate(id, updateFields, { new: true });

    if (!payroll) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Payroll Paid successfully", payroll });

    logOperation(req, "successfully");
    next();
  } catch (error) {
    console.error("Error updating expense:", error);
    logOperation(req, "Failed");
    res.status(500).json({ message: "Internal server error" });
    next();
  }
};

 
 
 
 



 
exports.getSalaryInfo = async (req, res) => {
  try {
    const { staffId } = req.params;
 
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }
 
    // Check which role the staff belongs to
    let filter = null;
    let includeLicenserData = false; // Flag to determine if we need licenser-related data
 
    const isRegionManager = await RegionManager.findOne({ _id: staffId }).lean();
    const isAreaManager = !isRegionManager ? await AreaManager.findOne({ _id: staffId }).lean() : null;
    const isBda = !isRegionManager && !isAreaManager ? await Bda.findOne({ _id: staffId }).lean() : null;
    const isSupportAgent = !isRegionManager && !isAreaManager && !isBda ? await SupportAgent.findOne({ _id: staffId }).lean() : null;
    const isSupervisor = !isRegionManager && !isAreaManager && !isBda && !isSupportAgent ? await Supervisor.findOne({ _id: staffId }).lean() : null;
 
    if (isRegionManager) {
      filter = { regionManager: staffId };
      includeLicenserData = true;
    } else if (isAreaManager) {
      filter = { areaManager: staffId };
      includeLicenserData = true;
    } else if (isBda) {
      filter = { bdaId: staffId };
      includeLicenserData = true;
    } else if (isSupportAgent || isSupervisor) {
      filter = { staffId };
    } else {
      return res.status(400).json({ message: "Invalid staff ID or role not found" });
    }
 
    let licenserCount = 0;
    let totalRenewalCount = 0;
 
    if (includeLicenserData) {
      // Find all licensers under the given staff
      const licensers = await Leads.find({ ...filter, customerStatus: "Licenser" }).select("_id").lean();
      licenserCount = licensers.length;
 
      if (licenserCount > 0) {
        const licenserIds = licensers.map((licenser) => licenser._id);
 
        // Sum up all the renewalCounts for these licensers
        const renewalData = await RenewalLicenser.aggregate([
          { $match: { licenser: { $in: licenserIds } } },
          { $group: { _id: null, totalRenewalCount: { $sum: "$renewalCount" } } }
        ]);
 
        totalRenewalCount = renewalData.length ? renewalData[0].totalRenewalCount : 0;
      }
    }
 
    // Find payroll records for the given staffId
    const payrollRecords = await Payroll.find({ staffId })
      .select("month totalSalary payRollStatus basicSalary")
      .lean();
 
    let basicSalary = 0;
    if (payrollRecords.length > 0) {
      basicSalary = payrollRecords[0].basicSalary || 0;
    }
 
    // Helper function to extract month name from YYYY-MM format
    const getMonthName = (dateString) => {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthNumber = parseInt(dateString.split("-")[1], 10);
      return months[monthNumber - 1] || "Invalid Month";
    };
 
    // Transform payroll records
    const payrollData = payrollRecords.map((record) => ({
      month: getMonthName(record.month),
      totalSalary: record.totalSalary,
      payRollStatus: record.payRollStatus,
    }));
 
    // Prepare response object
    const response = {
      basicSalary,
      payrollRecords: payrollData,
    };
 
    // Add licenserCount and totalRenewalCount only for RegionManager, AreaManager, and BDA
    if (includeLicenserData) {
      response.licenserCount = licenserCount;
      response.totalRenewalCount = totalRenewalCount;
    }
 
    res.json(response);
  } catch (error) {
    console.error("Error fetching salary info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logging operation middleware
const logOperation = (req, status, operationId = null) => {
  const { id, userName } = req.user || {};
  const log = { id, userName, status };

  if (operationId) {
    log.operationId = operationId;
  }

  req.user = log;
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