

const express = require("express")
 
const router = new express.Router()
 
 
 
const checkPermission = require('../controller/authController/permission');
 
const { verifyToken } = require('../controller/authController/middleware');
 
const ActivityLogGeneration = require('../controller/authController/activityLogController');
 
const leadController = require('../controller/leadsController')
 
const licenserController = require('../controller/licenserController')

const activityController = require('../controller/activityController')
 
const categoryController = require("../controller/cmsCategoryController");

const PostController = require("../controller/cmsPostController");

const NotificationController = require('../controller/notificationController')

const SubCategory = require('../controller/subCategory')

const ArticleController = require('../controller/articleController')

const TermsController = require('../controller/termsAndConditions')

// const upload = require("../database/connection/multer"); // Import the multer configuration


//add lead
router.post('/leads',verifyToken,checkPermission('Add Lead'),leadController.addLead,ActivityLogGeneration('Add Lead'))
 
router.get('/leads',verifyToken,checkPermission('View Lead'),leadController.getAllLeads)
 
router.get('/lead/:leadId',verifyToken,checkPermission('View Lead'),leadController.getLead)
 
router.put('/lead/:id',verifyToken,checkPermission('Edit Lead'),leadController.editLead,ActivityLogGeneration('Edit Lead'))
 
router.delete('/lead/:leadId',verifyToken,checkPermission('Delete Lead'),leadController.deleteLead,ActivityLogGeneration('Delete Lead'))
 
router.get('/client/:id',verifyToken,checkPermission('View Trial'),leadController.getClientDetails)

router.put("/trial/:leadId/hold",verifyToken,checkPermission('Hold Trial'), leadController.holdTrial,ActivityLogGeneration('Hold Trial'));
 
router.put("/trial/:leadId/resume",verifyToken,checkPermission('Resume Trial'), leadController.resumeTrial,ActivityLogGeneration('Resume Trial'));
 
//Trial
router.put('/trial/:leadId',verifyToken,checkPermission('Convert Trial'),leadController.convertLeadToTrial,ActivityLogGeneration('Convert Trial'))
 
router.get('/trial',verifyToken,checkPermission('View Trial'),leadController.getAllTrials)
 
router.put('/trials/:trialId',verifyToken,checkPermission('Convert Licenser'),leadController.convertTrialToLicenser,ActivityLogGeneration('Convert Licenser'))
 
router.post("/trial/:trialId",verifyToken,checkPermission('Extend Trial'),leadController.extendTrialDuration, ActivityLogGeneration('Extend Trial'));

router.get("/customer/statistics",verifyToken,leadController.getStatistics)


//add licenser
router.post('/licenser',verifyToken,checkPermission('Add Licenser'),licenserController.addLicenser,ActivityLogGeneration('Add Licenser'))
 
router.get('/licenser',verifyToken,checkPermission('View Licenser'),licenserController.getAllLicensers)
 
router.get('/licenser/:licenserId',verifyToken,checkPermission('View Licenser'),licenserController.getLicenser)
 
router.put('/licenser/:id',verifyToken,checkPermission('Edit Licenser'),licenserController.editLicenser,ActivityLogGeneration('Edit Licenser'))

router.get('/licenser/:id/details',verifyToken,checkPermission('View Licenser'),licenserController.getLicenserDetails)

router.post('/renew',verifyToken,checkPermission('Renew Licenser'), licenserController.renewLicenser,ActivityLogGeneration('Renew Licenser'));
 
// router.delete('/licenser/:licenserId',verifyToken,checkPermission('Delete Licenser'),leadController.deleteLead,ActivityLogGeneration('Delete Licenser'))

router.put("/licenser/:leadId/status",verifyToken,checkPermission('Deactivate Licenser'),licenserController.deactivateLicenser,ActivityLogGeneration('Deactivate Licenser'));


//Activity
router.post('/activity',verifyToken,checkPermission('Add Activity'), activityController.addActivity,ActivityLogGeneration('Add Activity'));
 
router.get('/activity/:id',verifyToken,checkPermission('View Activity'), activityController.getActivity);  
 
router.get('/activitys/:leadId',verifyToken,checkPermission('View Activity'),activityController.getAllActivities);
 
router.put("/activity/:id",verifyToken,checkPermission('Edit Activity'),activityController.editActivity,ActivityLogGeneration('Edit Activity'));
 
router.delete("/activity/:activityId",verifyToken,checkPermission('Delete Activity'), activityController.deleteActivity,ActivityLogGeneration('Delete Activity'));
 
router.get('/activities/:leadId',verifyToken,checkPermission('View Activity'),activityController.getLeadsActivityDetails);

router.get("/leads/:leadId",verifyToken,checkPermission('View Activity'), activityController.getLeadInteraction);
 

router.get("/leadEngagementOverTime/:leadId",verifyToken,checkPermission('View Activity'), activityController.getLeadEngagementOverTime);
 
 


router.get("/categories", categoryController.getAllCategories);       
router.post("/categories", categoryController.addCategory);        
router.get("/categories/:categoryId", categoryController.getOneCategory);
router.put("/categories/:categoryId", categoryController.editCategory);
router.delete("/categories/:categoryId", categoryController.deleteCategory)


router.post("/posts", PostController.addPost);  
router.put("/posts/:postId", PostController.editPost); 
router.get("/posts/:postId", PostController.getOnePost); 
router.delete("/posts/:postId", PostController.deletePost); 
router.get('/post',PostController.getAllPosts)

router.post("/notification", NotificationController.addNotification);
router.get("/notification", NotificationController.getAllNotifications);
router.get("/notification/:id", NotificationController.getOneNotification);
router.put("/notification/:id", NotificationController.editNotification);
router.delete("/notification/:id", NotificationController.deleteNotification);


router.post("/subcategory", SubCategory.addSubCategory);
router.get("/subcategory", SubCategory.getAllSubCategories);
router.put("/subcategory/:subCategoryId", SubCategory.editSubCategory);
router.get("/subcategory/:subCategoryId", SubCategory.getOneSubCategory);
router.delete("/subcategory/:subCategoryId", SubCategory.deleteSubCategory)


router.post("/article", ArticleController.addArticle);
router.get("/article", ArticleController.getAllArticles);
router.get("/article/:articleId", ArticleController.getOneArticle);
router.put("/article/:articleId", ArticleController.editArticle);
router.delete("/article/:articleId", ArticleController.deleteArticle)


router.post("/terms", TermsController.addTermsAndCondition);
router.get("/terms", TermsController.getAllTermsAndConditions);
router.get("/terms/:id", TermsController.getOneTermsAndCondition);
router.put("/terms/:id", TermsController.editTermsAndCondition);
router.delete("/terms/:id", TermsController.deleteTermsAndCondition);

module.exports = router