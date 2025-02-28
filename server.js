require('dotenv').config();
 
const express = require('express');
 
const cors = require('cors');
 
const http = require('http');
 
const { Server } = require('socket.io');
 
const server = express();
 
 
const Socket = require('./services/socketio');
 
const Router = require('./router/Router');
 
// Database connection
require('./database/connection/connection');
 
// CORS configuration
server.use(cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
}));
 
// Handle preflight requests
server.options('*', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
});
 
// Increase payload limits
server.use(express.json({ limit: '10mb' }));
server.use(express.urlencoded({ limit: '10mb', extended: true }));
 
// Use router
server.use(Router);
 
// HTTP server setup for WebSocket
const httpServer = http.createServer(server);
 
// Set up Socket.IO
// const io = new Server(httpServer, {
//     cors: {
//         origin: "*", // Update with your frontend's URL for production
//         methods: ["GET", "POST"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     },
// });

const io = new Server(httpServer, {
    path: "/nexsell-tickets/socket.io/", // Ensure this matches frontend
    cors: {
        origin: "*", // Update this with your frontend URL in production
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"], // Ensure WebSocket first
 });
 
// Pass io and socket to the Socket service to handle events
io.on('connection', (socket) => {
    Socket(socket, io); // Delegate to the Socket service
});
 
// Define the port
const PORT = 3004;
 
// Health check route
server.get('/', (req, res) => {
    res.status(200).json("Sales and Support server started - Tickets");
});
 
// Start the server
httpServer.listen(PORT, () => {
    console.log(`BillBizz Sales and Support server tickets started at port: ${PORT}`);
});