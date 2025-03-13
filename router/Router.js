

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

router.put("/deactivateLicenser/:leadId",verifyToken,checkPermission('Deactivate Licenser'),licenserController.deactivateLicenser,ActivityLogGeneration('Deactivate Licenser'));


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
router.post("/categories", verifyToken,checkPermission('Add Categories'),categoryController.addCategory,ActivityLogGeneration('Add Categories'));        
router.get("/categories/:categoryId", verifyToken,checkPermission('View Categories'),categoryController.getOneCategory);
router.put("/categories/:categoryId", verifyToken,checkPermission('Edit Categories'),categoryController.editCategory,ActivityLogGeneration('Edit Categories'));
router.delete("/categories/:categoryId",verifyToken,checkPermission('Delete Categories'), categoryController.deleteCategory,ActivityLogGeneration('Delete Categories'))


router.post("/posts",verifyToken,checkPermission('Add Post'),PostController.addPost,ActivityLogGeneration('Add Post'));  
router.put("/posts/:postId",verifyToken,checkPermission('Edit Post'), PostController.editPost,ActivityLogGeneration('Edit Post')); 
router.get("/posts/:postId", PostController.getOnePost,ActivityLogGeneration('View Post')); 
router.delete("/posts/:postId",verifyToken,checkPermission('Delete Post'), PostController.deletePost,ActivityLogGeneration('Delete Post')); 
router.get('/post',PostController.getAllPosts)
router.get("/authors", PostController.getAllAuthors);

router.post("/notification",verifyToken,checkPermission('Add Notification'), NotificationController.addNotification,ActivityLogGeneration('Add Notification'));
router.get("/notification", NotificationController.getAllNotifications);
router.get("/notification/:id",verifyToken,checkPermission('View Notification'), NotificationController.getOneNotification);
router.put("/notification/:id",verifyToken,checkPermission('Edit Notification'), NotificationController.editNotification,ActivityLogGeneration('Edit Notification'));
router.delete("/notification/:id",verifyToken,checkPermission('Delete Notification'), NotificationController.deleteNotification,ActivityLogGeneration('Delete Notification'));


router.post("/subcategory",verifyToken,checkPermission('Add SubCategories'), SubCategory.addSubCategory,ActivityLogGeneration('Add SubCategories'));
router.get("/subcategory", SubCategory.getAllSubCategories);
router.put("/subcategory/:subCategoryId",verifyToken,checkPermission('Edit SubCategories'), SubCategory.editSubCategory,ActivityLogGeneration('Edit SubCategories'));
router.get("/subcategory/:subCategoryId",verifyToken,checkPermission('View SubCategories'), SubCategory.getOneSubCategory);
router.delete("/subcategory/:subCategoryId",verifyToken,checkPermission('Delete SubCategories'), SubCategory.deleteSubCategory,ActivityLogGeneration('Delete SubCategories'))


router.post("/article",verifyToken,checkPermission('Add Article'), ArticleController.addArticle,ActivityLogGeneration('Add Article'));
router.get("/article", ArticleController.getAllArticles);
router.get("/article/:articleId", ArticleController.getOneArticle);
router.put("/article/:articleId",verifyToken,checkPermission('Edit Article'), ArticleController.editArticle,ActivityLogGeneration('Edit Article'));
router.delete("/article/:articleId",verifyToken,checkPermission('Delete Article'), ArticleController.deleteArticle,ActivityLogGeneration('Delete Article'))


router.post("/terms",verifyToken,checkPermission('Add Terms'), TermsController.addTermsAndCondition,ActivityLogGeneration('Add Terms'));
router.get("/terms", TermsController.getAllTermsAndConditions);
router.get("/terms/:id",verifyToken,checkPermission('View Terms'), TermsController.getOneTermsAndCondition);
router.put("/terms/:id",verifyToken,checkPermission('Edit Terms'), TermsController.editTermsAndCondition,ActivityLogGeneration('Edit Terms'));
router.delete("/terms/:id",verifyToken,checkPermission('Delete Terms'), TermsController.deleteTermsAndCondition,ActivityLogGeneration('Delete Terms'));


module.exports = router