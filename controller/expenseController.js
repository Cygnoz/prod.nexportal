// controllers/expenseController.js
const Expense = require("../database/model/expense");
const ActivityLog = require('../database/model/activityLog');
const axios = require("axios");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const filterByRole = require("../services/filterByRole");
const User = require("../database/model/user");
const Category = require('../database/model/category')

// Add a new expense
exports.addExpense = async (req, res, next) => {
  try {
    
    const { image, expenseName, date, expenseAccount, amount, category, note } = req.body;
    const data = req.body
     data.addedBy = req.user.id
    data.status = "Pending Approval"
    if (!expenseName || !date  || !amount || !category) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

   
    
// Expense id
let nextId = 1;
const lastUser = await Expense.findOne().sort({ _id: -1 }); // Sort by creation date to find the last one
if (lastUser) {
  const lastId = parseInt(lastUser.expenseId.slice(6));
  // Extract the numeric part from the customerID
  nextId = lastId + 1; // Increment the last numeric part
}
const expenseId = `EXPID-${nextId.toString().padStart(4, "0")}`;
data.expenseId = expenseId

    const expense = new Expense({ ...data });
    await expense.save();
    res.status(201).json({ message: "Expense added successfully", expense });
    logOperation(req, "successfully", expense._id);
    next();
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};


// Get a specific expense
exports.getExpense = async (req, res) => {
    try {
      const { id } = req.params;
      const expense = await Expense.findById(id)
        .populate("category","categoryName")
        .populate("approvedBy", "userName role") // Populate approvedBy with selected fields
        .populate("addedBy", "userName role employeeId") // Populate addedBy with selected fields
        .populate("rejectedBy", "userName role"); // Populate addedBy with selected fields
  
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
  
      res.status(200).json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

// Get all expenses

exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details to check role
    const user = await User.findById(userId);

    let filter = {};

    // Apply filter based on role
    const adminRoles = ["Super Admin", "Sales Admin", "Support Admin"];
    if (!adminRoles.includes(user.role)) {
      filter.addedBy = userId;
    }

    const { date, id } = req.query;

    // Date filter
    if (date) {
      const givenDate = new Date(date);
      const startOfMonth = new Date(givenDate.getFullYear(), givenDate.getMonth(), 1);
      const endOfMonth = new Date(givenDate.getFullYear(), givenDate.getMonth() + 1, 0);
      filter.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    // Category filter
    if (id) {
      filter.category = id;
    }

    // Fetch filtered expenses
    const expenses = await Expense.find(filter)
      .populate("category", "categoryName")
      .populate("addedBy", "userName role");

    // Calculate total and average expense amount using filtered expenses
    const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const averageExpense = expenses.length ? totalExpense / expenses.length : 0;

    // Count pending and rejected expenses within filtered expenses
    const pendingExpenses = expenses.filter(exp => exp.status === "Pending Approval").length;
    const rejectedExpenses = expenses.filter(exp => exp.status === "Rejected").length;

    res.status(200).json({
      message: "Expenses retrieved successfully",
      expenses,
      totalExpense,
      averageExpense,
      pendingExpenses,
      rejectedExpenses
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, ...data } = req.body; // Extract status separately
    const actionDate = new Date().toISOString(); // Capture current date-time

    const updateFields = { ...data };
    let action = "Edit"; // Default action

    if (status) {
      if (status === "Rejected") {
        updateFields.rejectedDate = actionDate;
        updateFields.rejectedBy = userId;
        action = "Rejected";
      } else if (status === "Approval Granted") {
        updateFields.approvalDate = actionDate;
        updateFields.approvedBy = userId;
        action = "Approved";
      }
    }

    // Update the expense with new values
    const expense = await Expense.findByIdAndUpdate(
      id,
      { ...updateFields, status }, // Merge status update
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Log activity
    const activity = new ActivityLog({
      userId: req.user.id,
      operationId: id,
      activity: `${req.user.userName} Successfully ${action} Expense.`,
      timestamp: actionDate,
      action: action,
      status: "Successfully",
      screen: "Expense",
    });
    await activity.save();

    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    console.error("Error updating expense:", error);

    // Log failure activity
    const failActivity = new ActivityLog({
      userId: req.user.id,
      operationId: req.params.id,
      activity: `${req.user.userName} Failed to update Expense.`,
      timestamp: new Date().toISOString(),
      action: "Update",
      status: "Failed",
      screen: "Expense",
    });
    await failActivity.save();

    res.status(500).json({ message: "Internal server error" });
  }
};



// Delete an expense
exports.deleteExpense = async (req, res, next) => {
    try {
      const { id } = req.params;
      const expense = await Expense.findById(id);
  
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
  
      // Allow deletion only if status is "Pending Approval"
      if (expense.status !== "Pending Approval") {
        return res
          .status(400)
          .json({ message: "Cannot delete expense as it has already been processed." });
      }
  
      // Delete the expense
      await Expense.findByIdAndDelete(id);
  
      res.status(200).json({ message: "Expense deleted successfully" });
      logOperation(req, "successfully");
      next();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Internal server error" });
      logOperation(req, "Failed");
      next();
    }
  };




exports.payExpense = async (req, res, next) => {
  try {
    const { id } = req.params; // Expense ID from params
    const userId = req.user.id;
    const { paidThroughAccount, expenseAccount, paymentMode } = req.body; // Include paymentMode

    const actionDate = new Date().toISOString(); // Capture current date-time

    // Fetch the expense data using the expenseId from params
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }


    // Generate JWT token
    const token = jwt.sign(
      {
        organizationId: process.env.ORGANIZATION_ID,
      },
      process.env.NEX_JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Fetch the categoryName from Category collection
    const category = await Category.findOne({ _id: expense.category });
    if (!category) {
      return res.status(404).json({ message: "Expense category not found" });
    }
    
    const categoryName = category.categoryName; // Assuming category schema has a 'name' field

    // Prepare request body for the external API
    const requestBody = {
      expenseDate: expense.date.toISOString().split("T")[0],
      paidThroughAccountId: paidThroughAccount,
      expenseCategory: categoryName, 
      gstTreatment:"Out Of Scope",
      destinationOfSupply:"Kerala",
      subTotal: expense.amount,
      grandTotal: expense.amount,
      expense: [
        {
          expenseAccountId: expenseAccount,
          taxGroup: "Non-Taxable",
          amount: expense.amount,
          total: expense.amount,
        },
      ],
    };
    console.log("Sending request to external API:", requestBody);
    console.log("Fetched expense data:", expense);

    
    // API call to external service
    const response = await axios.post(
      "https://devnexhub.azure-api.net/staff/add-expense-nexportal",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Expense request payload:", requestBody);

    // Update expense status after successful API call
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { 
        status: "Paid", 
        approvalDate: actionDate, 
        approvedBy: userId,
        paymentMode 
      },
      { new: true }
    );

    

    res.status(200).json({
      message: "Expense paid successfully",
      expense: updatedExpense,
      externalApiResponse: response.data,
    });

    logOperation(req, "Successfully updated expense");
    next();
  } catch (error) {
    console.error("Error updating expense:", error);
    logOperation(req, "Failed to update expense");
    res.status(500).json({ message: "Internal server error" });
    next();
  }
};


  
  exports.getAllAccounts = async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        {
          organizationId: process.env.ORGANIZATION_ID,
        },
        process.env.NEX_JWT_SECRET,
        { expiresIn: "12h" }
      );
  
      // https://billbizzapi.azure-api.net/accounts/get-all-account-nexportal
      // API call to external service
     const ACCOUNTS_API = process.env.ACCOUNTS_API;
     
         const response = await axios.get(
           `${ACCOUNTS_API}/get-all-account-nexportal`,
           {
             headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
             },
           }
         );
  
      const allAccounts = response.data;
  
      // Filtering into two sets
      const paidThroughAccount = allAccounts.filter((account) =>
        ["Cash", "Bank"].includes(account.accountSubhead)
      );
  
      const ExpenseAccount = allAccounts.filter((account) =>
        ["Direct Expense", "Indirect Expense"].includes(account.accountSubhead)
      );
  
      // Sending response
      res.status(200).json({
        paidThroughAccount,
        ExpenseAccount,
      });
    } catch (error) {
      console.error("Error fetching accounts:", error);
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