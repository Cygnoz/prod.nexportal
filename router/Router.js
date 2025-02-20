const express = require("express")

const router = new express.Router()

const TicketController = require('../controller/ticketsController')

const PraiseController = require('../controller/praiseController')

const chatController = require('../controller/ticketChat')

const targetController = require('../controller/targetController')

const checkPermission = require('../controller/authController/permission');

const { verifyToken } = require('../controller/authController/middleware');

const ActivityLogGeneration = require('../controller/authController/activityLogController');


router.post('/ticket',verifyToken,checkPermission('Add Ticket'),TicketController.addTicket,ActivityLogGeneration('Add Ticket'))

router.post('/unassigned-ticket',TicketController.unassignedTickets)

router.get('/tickets',verifyToken,checkPermission('View Ticket'),TicketController.getAllTickets)

router.get('/unassigned-ticket',verifyToken,checkPermission('View Ticket'),TicketController.getAllUnassignedTickets)

router.get('/ticket/:ticketId',verifyToken,checkPermission('View Ticket'),TicketController.getTicket)

router.post('/add-feedback',verifyToken,checkPermission('Add Feedback'), TicketController.addFeedback);


//chat
// router.post('/chat', chatController.sendMessage);

router.get('/chats/lead/:leadId',verifyToken,checkPermission('View Chat'), chatController.getChatByCustomer);
 
router.get('/history/:ticketId',chatController.getChatHistory);

router.get('/getCustomers',TicketController.getCustomers)

router.put('/ticket/:ticketId',verifyToken,checkPermission('Edit Ticket'),TicketController.updateTicket,ActivityLogGeneration('Edit Ticket'))
// router.delete('/delete-ticket/:ticketId',verifyToken,checkPermission('Delete Ticket'),TicketController.deleteTicket)

router.post('/Praise',verifyToken,checkPermission('Add Praise'),PraiseController.addPraise,ActivityLogGeneration('Add Praise'))

router.get('/Praises',verifyToken,checkPermission('View Praise'),PraiseController.getAllPraises)

router.get("/praises/:userId",verifyToken,checkPermission('View Praise'),PraiseController.getAllPraisesForUser);


// target
//Target
router.post("/targets",verifyToken,checkPermission('Add Target'), targetController.addTarget,ActivityLogGeneration('Add Target'));

router.get('/targets',verifyToken,checkPermission('View Target'), targetController.getAllTargets);

router.get('/targets/:id',verifyToken,checkPermission('View Target'), targetController.getTargetById);

router.put("/targets/:id",verifyToken,checkPermission('Edit Target'),targetController.updateTarget,ActivityLogGeneration('Edit Target'));

router.delete("/targets/:id",verifyToken,checkPermission('Delete Target'),targetController.deleteTarget,ActivityLogGeneration('Delete Target'));

router.get('/targetAchieved',verifyToken,checkPermission('View Target'), targetController.getAchievedTargets);

router.get('/yearlyTargets',verifyToken,checkPermission('View Target'), targetController.getYearlyTargets);

module.exports = router
