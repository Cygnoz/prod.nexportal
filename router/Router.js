const express = require("express")

const router = new express.Router()

const userController = require('../controller/userController')
const regionController = require("../controller/regionController");
const areaController = require("../controller/areaController");
const commissionController = require('../controller/commissionController');
const supervisorController = require('../controller/supervisorController');
const supportAgentController = require('../controller/supportAgentController');
const dashboardController = require('../controller/dashboardController');
const regionDashboardController = require('../controller/regionDashboardController');

const checkPermission = require('../controller/authController/permission');

const { verifyToken } = require('../controller/authController/middleware');

const ActivityLogGeneration = require('../controller/authController/activityLogController');

// login
router.post('/login',userController.login)
router.get('/logout/:id',userController.logout)

router.post('/verify-otp',userController.verifyOtp)
router.post('/roles',userController.addOrUpdateRoles)
router.get('/countries',userController.getCountriesData)
router.get('/dropdown-data',userController.getRegionsAreasBdas)

router.put("/business-cards",verifyToken,checkPermission('View Region'), userController.updateBusinessCard);

router.get('/business-card',verifyToken,checkPermission('View Region'), userController.getBusinessCard);


router.get('/activity-logs/:id',verifyToken,checkPermission('View Region'), regionController.getActivityLogByOperationId);
router.get('/area-activity-logs/:id',verifyToken,checkPermission('View Area'), areaController.getActivityLogByAreaId);

// region
router.post("/region",verifyToken,checkPermission('Add Region'), regionController.addRegion,ActivityLogGeneration('Add Region'));

router.get("/region/:regionId",verifyToken,checkPermission('View Region'), regionController.getRegion);

router.get("/regions",verifyToken,checkPermission('View Region'), regionController.getAllRegions);

router.put("/region/:regionId",verifyToken,checkPermission('Edit Region'), regionController.updateRegion,ActivityLogGeneration('Edit Region'));

router.delete("/region/:regionId",verifyToken,checkPermission('Delete Region'), regionController.deleteRegion,ActivityLogGeneration('Delete Region'));

router.put("/deactivateRegion/:regionId",verifyToken,checkPermission('Deactivate Region'), regionController.deactivateRegion,ActivityLogGeneration('Deactivate Region'));

router.get("/regions/:id/areas",verifyToken,checkPermission('View Region'), regionController.getAreasByRegion);

router.get('/lead-source', verifyToken,checkPermission('View Region'), regionDashboardController.getLeadSourceGraph);

router.get("/regions/:id/details",verifyToken,checkPermission('View Region'), regionController.getRegionDetails);

router.get("/areaPerformance/:regionId",verifyToken,checkPermission('View Region'),regionDashboardController.getPerformanceByArea);

router.get("/conversion-rate/:regionId",verifyToken,checkPermission('View Region'), regionDashboardController.getConversionRate);

 

// region dashboard
router.get("/regions/:regionId/areas",verifyToken,checkPermission('View Region'), regionDashboardController.getAreasByRegion);

router.get('/team-counts/:id?',verifyToken,checkPermission('View Region'), dashboardController.getTeamCounts);

router.get('/conversion-rate/:id',verifyToken,checkPermission('View Region'), dashboardController.getLeadConversionRate);

router.get('/top-performers/:regionId',verifyToken,checkPermission('View Region'), regionDashboardController.getTopPerformersByRegion);

router.get('/tickets/solved-by-region',verifyToken,checkPermission('View Region'), dashboardController.getSolvedTicketsByRegion);

// area
router.post("/area",verifyToken,checkPermission('Add Area'), areaController.addArea,ActivityLogGeneration('Add Area'));

router.get("/area/:areaId",verifyToken,checkPermission('View Area'), areaController.getArea);

router.get("/areas",verifyToken,checkPermission('View Area'), areaController.getAllAreas);

router.put("/area/:areaId",verifyToken,checkPermission('Edit Area'), areaController.updateArea,ActivityLogGeneration('Edit Area'));

router.delete("/area/:areaId",verifyToken,checkPermission('Delete Area'), areaController.deleteArea,ActivityLogGeneration('Delete Area'));

router.put("/deactivateArea/:areaId",verifyToken,checkPermission('Deactivate Area'), areaController.deactivateArea,ActivityLogGeneration('Deactivate Area'));

router.get("/areas/:id/overview",verifyToken,checkPermission('View Region'), areaController.getAreaDetails);

router.get("/areas/:id/lead",verifyToken,checkPermission('View Region'), areaController.getAreaLeadDetails);


// commission
router.post('/commissions', verifyToken,checkPermission('Add Commission'), commissionController.addCommission,ActivityLogGeneration('Add Commission'));

router.get('/commissions/:Id',verifyToken,checkPermission('View Commission'),  commissionController.getCommission);

router.get('/commissions',verifyToken,checkPermission('View Commission'),  commissionController.getAllCommissions);

router.put('/commissions/:Id',verifyToken,checkPermission('Edit Commission'),  commissionController.updateCommission,ActivityLogGeneration('Edit Commission'));

router.delete('/commissions/:Id',verifyToken,checkPermission('Delete Commission'),  commissionController.deleteCommission,ActivityLogGeneration('Delete Commission'));

// supervisor
router.get("/supervisor-check/:id",verifyToken,checkPermission('Add Supervisor'), supervisorController.addSupervisorCheck);

router.post('/supervisor',verifyToken,checkPermission('Add Supervisor'),supervisorController.addSupervisor,ActivityLogGeneration('Add Supervisor'))

router.get("/supervisor",verifyToken,checkPermission('View Supervisor'), supervisorController.getAllSupervisor);

router.get("/supervisor/:id",verifyToken,checkPermission('View Supervisor'), supervisorController.getSupervisor);

router.put("/supervisor/:id",verifyToken,checkPermission('Edit Supervisor'), supervisorController.editSupervisor,ActivityLogGeneration('Edit Supervisor'));

router.delete("/supervisor/:id",verifyToken,checkPermission('Delete Supervisor'), supervisorController.deleteSupervisor,ActivityLogGeneration('Delete Supervisor'));

router.put("/deactivateSupervisor/:id", verifyToken,checkPermission('Deactivate Supervisor'),supervisorController.deactivateSupervisor,ActivityLogGeneration('Deactivate Supervisor'));

router.get("/supervisor/:id/details",verifyToken,checkPermission('View Supervisor'), supervisorController.getSupervisorDetails);

// Support Agent
router.post('/supportAgent',verifyToken,checkPermission('Add Support Agent'),supportAgentController.addSupportAgent,ActivityLogGeneration('Add Support Agent'))

router.get("/supportAgent",verifyToken,checkPermission('View Support Agent'), supportAgentController.getAllSupportAgent);

router.get("/supportAgent/:id",verifyToken,checkPermission('View Support Agent'), supportAgentController.getSupportAgent);

router.put("/supportAgent/:id",verifyToken,checkPermission('Edit Support Agent'), supportAgentController.editSupportAgent,ActivityLogGeneration('Edit Support Agent'));

router.delete("/supportAgent/:id",verifyToken,checkPermission('Delete Support Agent'), supportAgentController.deleteSupportAgent,ActivityLogGeneration('Delete Support Agent'));

router.put("/deactivatesupportAgent/:id", verifyToken,checkPermission('Deactivate Support Agent'),supportAgentController.deactivateSupportagent,ActivityLogGeneration('Deactivate Support Agent'));

router.get("/supportAgent/:id/details",verifyToken,checkPermission('View Support Agent'), supportAgentController.getSupportAgentDetails);

router.get("/tickets/overtime/:id",verifyToken,checkPermission('View Support Agent'), supportAgentController.getTicketsOverTime );

// dashboard
router.get("/counts",verifyToken,dashboardController.getDocumentCounts );


module.exports = router
