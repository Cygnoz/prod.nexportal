const mongoose = require("mongoose");
const moment = require("moment");
const Payroll = require("../database/model/payroll");
const RegionManager = require("../database/model/regionManager");
const AreaManager = require("../database/model/areaManager");
const Bda = require("../database/model/bda");
const Supervisor = require("../database/model/supervisor");
const SupportAgent = require("../database/model/supportAgent");
const Leads = require("../database/model/leads");

// exports.generatePayroll = async (req, res) => {
//   try {
//     const { month, year } = req.body;

//     const userId = req.user.id;
//     const payrollMonth = `${year}-${month}`;

//     const startDate = moment(`${payrollMonth}-01`)
//       .startOf("month")
//       .format("YYYY-MM-DD HH:mm:ss");
//     const endDate = moment(`${payrollMonth}-01`)
//       .endOf("month")
//       .format("YYYY-MM-DD HH:mm:ss");

//     // Check if payroll already exists for this month
//     const existingPayroll = await Payroll.find({ month: payrollMonth });
//     if (existingPayroll.length > 0) {
//       return res.status(200).json({
//         message: "Payroll already generated for this month.",
//       });
//     }

//     // Define staff roles & models
//     const staffRoles = [
//       { model: RegionManager, role: "regionManager", hasCommission: true },
//       { model: AreaManager, role: "areaManager", hasCommission: true },
//       { model: Bda, role: "bdaId", hasCommission: true },
//       { model: Supervisor, role: "supervisor", hasCommission: false },
//       { model: SupportAgent, role: "supportAgent", hasCommission: false },
//     ];

//     const payrollEntries = [];

//     for (const { model, role, hasCommission } of staffRoles) {
//       const staffList = await model.find({ status: "Active" }).populate({
//         path: "commission",
//         select: "commissionPoint recurringPoint perPointValue thresholdLicense",
//       });

//       for (const staff of staffList) {
//         const { _id, dateOfJoining, salaryAmount, commission } = staff;
//         const joiningMonthYear = moment(dateOfJoining).format("YYYY-MM");

//         let adjustedSalary = salaryAmount;

//         // Adjust salary for joining month
//         if (joiningMonthYear === payrollMonth) {
//           const joiningDate = moment(dateOfJoining);
//           const payrollDate = moment(`${year}-${month}-01`);
//           const endOfMonth = payrollDate.clone().endOf("month");

//           let workingDays = 0;
//           for (
//             let d = joiningDate.clone();
//             d.isBefore(endOfMonth);
//             d.add(1, "days")
//           ) {
//             if (d.isoWeekday() !== 6 && d.isoWeekday() !== 7) {
//               // Exclude weekends
//               workingDays++;
//             }
//           }

//           const perDaySalary = salaryAmount / 22;
//           adjustedSalary = Number((perDaySalary * workingDays).toFixed(0));
//         }



//         let newLicenseEarnings = 0,
//           recuringAmount = 0,
//           totalLicenses = 0,
//           recurringLicenses = 0;

//         if (hasCommission && commission) {
//           // Fetch total and recurring licenses
//           totalLicenses = await Leads.countDocuments({
//             [role]: _id,
//             customerStatus: "Licenser",
//             licensorDate: { $gte: startDate, $lt: endDate },
//           });

//           recurringLicenses = await Leads.countDocuments({
//             [role]: _id,
//             customerStatus: "Licenser",
//             renewalDate: { $gte: startDate, $lt: endDate },
//           });

//           // Calculate commission earnings
//           if (totalLicenses >= commission.thresholdLicense) {
//             const newLicenses = totalLicenses - commission.thresholdLicense;
//             const licenseCommissionPoint =
//               newLicenses * commission.commissionPoint;
//             newLicenseEarnings =
//               licenseCommissionPoint * commission.perPointValue;

//             const renewalCommissionPoint =
//               recurringLicenses * commission.recurringPoint;
//             recuringAmount = renewalCommissionPoint * commission.perPointValue;
//           }
//         }

//         // If no commission, basic salary = total salary
//         const totalSalary = hasCommission
//           ? Number(
//               (adjustedSalary + newLicenseEarnings + recuringAmount).toFixed(0)
//             )
//           : adjustedSalary;

        
//         // Ensure only one payroll document per staff per month
//         const existingPayrollEntry = await Payroll.findOne({
//           staffId: _id,
//           month: payrollMonth,
//         });
//         // Payroll id
//         let nextId = 1;
//         const lastPayroll = await Payroll.findOne().sort({ _id: -1 }); // Sort by creation date to find the last one
//         if (lastPayroll) {
//           const lastId = parseInt(lastPayroll.payslipId.slice(6));
//           // Extract the numeric part from the customerID
//           nextId = lastId + 1; // Increment the last numeric part
//         }
//         const payslipId = `PAYROLL-${nextId.toString().padStart(4, "0")}`;

//         if (!existingPayrollEntry) {
//           payrollEntries.push({
//             staffId: _id,
//             payslipId ,
//             payslipStatus: "Pending Generation",
//             basicSalary: adjustedSalary,
//             commissionProfile:
//               hasCommission && commission ? commission._id : null,
//             totalLicenses,
//             recurringLicenses,
//             newLicenseEarnings,
//             recuringAmount,
//             totalSalary,
//             TravelAllowance: 0,
//             comments: "",
//             month: payrollMonth,
//             generatedBy: userId,
//           });
//         }
//       }
//     }

//     if (payrollEntries.length > 0) {
//       await Payroll.insertMany(payrollEntries);
//     }
//     res
//       .status(200)
//       .json({
//         message: "Payroll generated successfully.",
//         entries: payrollEntries,
//       });
//   } catch (error) {
//     console.error("Error generating payroll:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };


// exports.getAllPayrolls = async (req, res) => {
//   try {
//     const payrolls = await Payroll.find()
//       .populate({
//         path: "staffId",
//         select: "user", // Only include `user` in staffId
//         populate: { path: "user", select: "userName role -_id" } // Nested population, only `userName` and `role`
//       });

//     res.status(200).json(payrolls);
//   } catch (error) {
//     console.error("Error fetching payrolls:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


// exports.generatePayroll = async (req, res) => {
//   try {
//     const { month, year } = req.body;
//     const userId = req.user.id;
//     const payrollMonth = `${year}-${month}`;

//     const startDate = moment(`${payrollMonth}-01`).startOf("month").format("YYYY-MM-DD HH:mm:ss");
//     const endDate = moment(`${payrollMonth}-01`).endOf("month").format("YYYY-MM-DD HH:mm:ss");

//     // Check if payroll already exists for this month
//     const existingPayroll = await Payroll.find({ month: payrollMonth });
//     if (existingPayroll.length > 0) {
//       return res.status(200).json({ message: "Payroll already generated for this month." });
//     }

//     // Define staff roles & models
//     const staffRoles = [
//       { model: RegionManager, role: "regionManager", hasCommission: true },
//       { model: AreaManager, role: "areaManager", hasCommission: true },
//       { model: Bda, role: "bdaId", hasCommission: true },
//       { model: Supervisor, role: "supervisor", hasCommission: false },
//       { model: SupportAgent, role: "supportAgent", hasCommission: false },
//     ];

//     const payrollEntries = [];
//     let nextId = 1;
//     const lastPayroll = await Payroll.findOne().sort({ _id: -1 });
//     if (lastPayroll) {
//       const lastId = parseInt(lastPayroll.payslipId.slice(8));
//       nextId = lastId + 1;
//     }

//     for (const { model, role, hasCommission } of staffRoles) {
//       const staffList = await model.find({ status: "Active" }).populate({
//         path: "commission",
//         select: "commissionPoint recurringPoint perPointValue thresholdLicense",
//       });

//       for (const staff of staffList) {
//         const { _id, dateOfJoining, salaryAmount, commission } = staff;
//         const joiningMonthYear = moment(dateOfJoining).format("YYYY-MM");
//         console.log(joiningMonthYear);
//         console.log(payrollMonth);
        
        
//         let adjustedSalary = salaryAmount;
//         if (joiningMonthYear === payrollMonth) {
//           const joiningDate = moment(dateOfJoining);
//           const payrollDate = moment(`${year}-${month}-01`);
//           const endOfMonth = payrollDate.clone().endOf("month");
//           let workingDays = 0;
//           for (let d = joiningDate.clone(); d.isBefore(endOfMonth); d.add(1, "days")) {
//             if (d.isoWeekday() !== 6 && d.isoWeekday() !== 7) {
//               workingDays++;
//             }
//           }
//           console.log(workingDays);
          
//           const perDaySalary = salaryAmount / 22;
//           adjustedSalary = Number((perDaySalary * workingDays).toFixed(0));
//         }

//         let newLicenseEarnings = 0,
//           recuringAmount = 0,
//           totalLicenses = 0,
//           recurringLicenses = 0;

//         if (hasCommission && commission) {
//           totalLicenses = await Leads.countDocuments({
//             [role]: _id,
//             customerStatus: "Licenser",
//             licensorDate: { $gte: startDate, $lt: endDate },
//           });

//           recurringLicenses = await Leads.countDocuments({
//             [role]: _id,
//             customerStatus: "Licenser",
//             renewalDate: { $gte: startDate, $lt: endDate },
//           });

//           if (totalLicenses >= commission.thresholdLicense) {
//             const newLicenses = totalLicenses - commission.thresholdLicense;
//             const licenseCommissionPoint = newLicenses * commission.commissionPoint;
//             newLicenseEarnings = licenseCommissionPoint * commission.perPointValue;

//             const renewalCommissionPoint = recurringLicenses * commission.recurringPoint;
//             recuringAmount = renewalCommissionPoint * commission.perPointValue;
//           }
//         }

//         const totalSalary = hasCommission
//           ? Number((adjustedSalary + newLicenseEarnings + recuringAmount).toFixed(0))
//           : adjustedSalary;

//         const existingPayrollEntry = await Payroll.findOne({
//           staffId: _id,
//           month: payrollMonth,
//         });

//         const payslipId = `PAYROLL-${nextId.toString().padStart(4, "0")}`;
//         nextId++;

//         if (!existingPayrollEntry) {
//           payrollEntries.push({
//             staffId: _id,
//             payslipId,
//             payslipStatus: "Pending Generation",
//             basicSalary: adjustedSalary,
//             commissionProfile: hasCommission && commission ? commission._id : null,
//             totalLicenses,
//             recurringLicenses,
//             newLicenseEarnings,
//             recuringAmount,
//             totalSalary,
//             TravelAllowance: 0,
//             comments: "",
//             month: payrollMonth,
//             generatedBy: userId,
//           });
//         }
//       }
//     }

//     if (payrollEntries.length > 0) {
//       await Payroll.insertMany(payrollEntries);
//     }

//     res.status(200).json({
//       message: "Payroll generated successfully.",
//       entries: payrollEntries,
//     });
//   } catch (error) {
//     console.error("Error generating payroll:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const payrollMonth = `${year}-${month}`;
    const startDate = moment(`${payrollMonth}-01`).startOf('month').format("YYYY-MM-DD HH:mm:ss");
    const endDate = moment(`${payrollMonth}-01`).endOf('month').format("YYYY-MM-DD HH:mm:ss");

    // Check if payroll already exists for this month
    const existingPayroll = await Payroll.findOne({ month: payrollMonth });
    if (existingPayroll) {
      return res.status(400).json({ message: "Payroll already generated for this month." });
    }

    const regionManagers = await RegionManager.find({ status: "Active" }).populate({
      path: "commission",
      select: "commissionPoint recurringPoint perPointValue thresholdLicense",
    });

    const payrollEntries = [];
    for (const manager of regionManagers) {
      const { _id, dateOfJoining, salaryAmount, commission } = manager;
      const joiningMonthYear = moment(dateOfJoining).format("YYYY-MM");
      let adjustedSalary = salaryAmount;

      // Adjust salary if joining date is in the same payroll month
      if (joiningMonthYear === payrollMonth) {
        const joiningDate = moment(dateOfJoining);
        const payrollDate = moment(`${year}-${month}-01`);
        const endOfMonth = payrollDate.clone().endOf('month');

        let workingDays = 0;
        for (let d = joiningDate.clone(); d.isBefore(endOfMonth); d.add(1, 'days')) {
          if (d.isoWeekday() !== 6 && d.isoWeekday() !== 7) { // Exclude Saturday & Sunday
            workingDays++;
          }
        }

        const perDaySalary = salaryAmount / 22;
        adjustedSalary = perDaySalary * workingDays;
      }

      // Fetch total and recurring licenses with correct date matching
      const totalLicenses = await Leads.countDocuments({
        regionManager: _id,
        customerStatus: "Licenser",
        licensorDate: { $gte: startDate, $lt: endDate },
      });

      const recurringLicenses = await Leads.countDocuments({
        regionManager: _id,
        customerStatus: "Licenser",
        renewalDate: { $gte: startDate, $lt: endDate },
      });

      let newLicenseEarnings = 0, recuringAmount = 0;
      if (totalLicenses >= commission.thresholdLicense) {
        const newLicenses = totalLicenses - commission.thresholdLicense;
        const licenseCommissionPoint = newLicenses * commission.commissionPoint;
        newLicenseEarnings = licenseCommissionPoint * commission.perPointValue;

        const renewalCommissionPoint = recurringLicenses * commission.recurringPoint;
        recuringAmount = renewalCommissionPoint * commission.perPointValue;
      }

      const totalSalary = adjustedSalary + newLicenseEarnings + recuringAmount;

      // Ensure only one payroll document per staff per month
      const existingPayrollEntry = await Payroll.findOne({ staffId: _id, month: payrollMonth });
      if (!existingPayrollEntry) {
        payrollEntries.push({
          staffId: _id,
          payslipStatus: "Pending Generation",
          basicSalary: adjustedSalary,
          commissionProfile: commission ? commission._id : null,
          totalLicenses,
          recurringLicenses,
          newLicenseEarnings,
          recuringAmount,
          totalSalary,
          TravelAllowance: 0,
          comments: "",
          month: payrollMonth,
          generatedAt: new Date(),
        });
      }
    }

    if (payrollEntries.length > 0) {
      await Payroll.insertMany(payrollEntries);
    }

    res.status(200).json({ message: "Payroll generated successfully.", entries: payrollEntries });
  } catch (error) {
    console.error("Error generating payroll:", error.message);
    res.status(500).json({ message: error.message });
  }
};



exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, year } = req.params; // Extract month and year from params
    const payrollMonth = `${year}-${month}`;

    // Construct start and end dates for filtering
    // const startDate = moment(`${year}-${month}-01`).startOf("month").toDate();
    // const endDate = moment(`${year}-${month}-01`).endOf("month").toDate();

    const payrolls = await Payroll.find({
      month: payrollMonth
    }).populate({
      path: "staffId",
      select: "user",
      populate: { path: "user", select: "userName role -_id" }
    });

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
      select: "user", // Only include `user` in staffId
      populate: { path: "user", select: "userName role -_id" } // Nested population, only `userName` and `role`
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
