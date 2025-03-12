const express = require("express")

const router = new express.Router()

const userController = require('../controller/userController')

const regionManagerController = require('../controller/regionManagerController')

const areaManagerController = require('../controller/areaManagerController')

const bdaController = require('../controller/bdaController')

const payrollController = require('../controller/payrollController')

const categoryController = require('../controller/categoryController')

const expenseController = require('../controller/expenseController')



const checkPermission = require('../controller/authController/permission');

const { verifyToken } = require('../controller/authController/middleware');

const ActivityLogGeneration = require('../controller/authController/activityLogController');

// User
router.post('/user',verifyToken,checkPermission('Add User'),userController.addUser,ActivityLogGeneration('Add User'))

router.get("/users",verifyToken,checkPermission('View User'), userController.getAllUsers);

router.get("/user/:userId",verifyToken,checkPermission('View User'), userController.getUser);

router.put("/user/:userId",verifyToken,checkPermission('Edit User'), userController.updateUser,ActivityLogGeneration('Edit User'));

router.delete("/user/:userId",verifyToken,checkPermission('Delete User'), userController.deleteUser,ActivityLogGeneration('Delete User'));

// Region manager
router.get("/region-manager-check/:id",verifyToken,checkPermission('Add Area Manager'), regionManagerController.addRegionManagerCheck);

router.post('/region-manager',verifyToken,checkPermission('Add Region Manager'),regionManagerController.addRegionManager,ActivityLogGeneration('Add Region Manager'))

router.get("/region-managers",verifyToken,checkPermission('View Region Manager'), regionManagerController.getAllRegionManager);

router.get("/region-managers/:id",verifyToken,checkPermission('View Region Manager'), regionManagerController.getRegionManager);

router.put("/region-managers/:id",verifyToken,checkPermission('Edit Region Manager'), regionManagerController.editRegionManager,ActivityLogGeneration('Edit Region Manager'));

router.get("/region-manager/:id/details",verifyToken,checkPermission('View Region Manager'), regionManagerController.getRegionManagerDetails);

router.delete("/region-managers/:id",verifyToken,checkPermission('Delete Region Manager'), regionManagerController.deleteRegionManager,ActivityLogGeneration('Delete Region Manager'));

router.put('/deactivateRm/:id',verifyToken,checkPermission('Deactivate Region Manager'),regionManagerController.deactivateRegionManager,ActivityLogGeneration('Deactivate Region Manager'))

router.get('/region-managers/:id/areamanager',verifyToken,checkPermission('View Region Manager'),regionManagerController.topPerformingAreaManagers)

 
// Area manager
router.put("/area-manager-check",verifyToken,checkPermission('Add Area Manager'), areaManagerController.addAreaManagerCheck);

router.post('/area-manager',verifyToken,checkPermission('Add Area Manager'),areaManagerController.addAreaManager,ActivityLogGeneration('Add Area Manager'))

router.get("/area-managers",verifyToken,checkPermission('View Area Manager'), areaManagerController.getAllAreaManager);

router.get("/area-managers/:id",verifyToken,checkPermission('View Area Manager'), areaManagerController.getAreaManager);

router.put("/area-managers/:id",verifyToken,checkPermission('Edit Area Manager'), areaManagerController.editAreaManager,ActivityLogGeneration('Edit Area Manager'));

router.delete("/area-managers/:id",verifyToken,checkPermission('Delete Area Manager'), areaManagerController.deleteAreaManager,ActivityLogGeneration('Delete Area Manager'));

router.put("/deactivateAm/:id",verifyToken,checkPermission('Deactivate Area Manager'),areaManagerController.deactivateAreamanager,ActivityLogGeneration('Deactivate Area Manager'));

router.get('/area-manager/:id/details',verifyToken,checkPermission('View Area Manager'), areaManagerController.getAreaManagerDetails);

router.get('/area-managerOverTime/:id',verifyToken,checkPermission('View Area Manager'), areaManagerController.getAreaManagerConversionOverTime);

router.get('/commission/:id',verifyToken,checkPermission('View Area Manager'),areaManagerController.getCommissionProfile)


// BDA
// Area manager
router.put("/bda-check",verifyToken,checkPermission('Add BDA'), bdaController.bdaCheck);

// router.get("/bda-details/:id",verifyToken,checkPermission('View BDA'), bdaController.getBdaDetails);

router.get("/bda-details/:id/customers",verifyToken,checkPermission('View BDA'), bdaController.getLeadDetails);

router.post('/bda',verifyToken,checkPermission('Add BDA'),bdaController.addBda,ActivityLogGeneration('Add BDA'))

router.get("/bda",verifyToken,checkPermission('View BDA'), bdaController.getAllBda);

router.get("/bda/:id",verifyToken,checkPermission('View BDA'), bdaController.getBda);

router.put("/bda/:id",verifyToken,checkPermission('Edit BDA'), bdaController.editBda,ActivityLogGeneration('Edit BDA'));

router.delete("/bda/:id",verifyToken,checkPermission('Delete BDA'), bdaController.deleteBda,ActivityLogGeneration('Delete BDA'));

router.get("/bda/:id/trial-conversions",verifyToken,checkPermission('View BDA'), bdaController.getTrialConvertedOverTime);

router.put("/deactivateBda/:id", verifyToken,checkPermission('Deactivate BDA'),bdaController.deactivateBda,ActivityLogGeneration('Deactivate BDA'));

router.get("/renewalBda/:bdaId",verifyToken,checkPermission('View BDA'), bdaController.getBdaRenewalCount);

router.get('/get-activity-logs',verifyToken,checkPermission('View logs'),userController.getAllActivityLogs)


// payroll
router.post("/payroll",verifyToken,checkPermission('Generate Payroll'), payrollController.generatePayroll,ActivityLogGeneration('Generate Payroll'));

router.get("/payroll/:id",verifyToken,checkPermission('View Payroll'), payrollController.getPayrollById);

router.get("/payroll/:year/:month",verifyToken,checkPermission('View Payroll'), payrollController.getAllPayrolls);

router.put("/payroll/:id",verifyToken,checkPermission('Edit Payroll'), payrollController.updatePayroll);

router.put("/pay-payrol/:id",verifyToken,checkPermission('Pay Payroll'), payrollController.payPayroll,ActivityLogGeneration('Pay Payroll'))

router.get("/salaryInfo/:staffId",verifyToken,checkPermission('View Payroll'), payrollController.getSalaryInfo);


// expense category
router.post("/category",verifyToken,checkPermission('Add Category'), categoryController.addCategory,ActivityLogGeneration('Add Category'));

router.get("/category/:id",verifyToken,checkPermission('View Category'), categoryController.getCategory);

router.get("/category",verifyToken,checkPermission('View Category'), categoryController.getAllCategories);

router.put("/category/:id",verifyToken,checkPermission('Edit Category'), categoryController.updateCategory,ActivityLogGeneration('Edit Category'));

router.delete("/category/:id",verifyToken,checkPermission('Delete Category'), categoryController.deleteCategory,ActivityLogGeneration('Delete Category'));

// expense 
router.post("/expense",verifyToken,checkPermission('Add Expense'), expenseController.addExpense,ActivityLogGeneration('Add Expense'));

router.get("/expense/:id",verifyToken,checkPermission('View Expense'), expenseController.getExpense);

router.get("/expense",verifyToken,checkPermission('View Expense'), expenseController.getAllExpenses);

router.put("/expense/:id",verifyToken,checkPermission('Edit Expense'), expenseController.updateExpense,ActivityLogGeneration('Edit Expense'));

router.delete("/expense/:id",verifyToken,checkPermission('Delete Expense'), expenseController.deleteExpense,ActivityLogGeneration('Delete Expense'));

router.get("/get-all-accounts",verifyToken,checkPermission('View Expense'), expenseController.getAllAccounts);

router.put("/pay-expense/:id",verifyToken,checkPermission('Pay Expense'), expenseController.payExpense,ActivityLogGeneration('Pay Expense'));

module.exports = router