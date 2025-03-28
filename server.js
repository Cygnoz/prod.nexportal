
require('dotenv').config()

const express = require('express')

const cors = require('cors')

const server = express()

const Router = require("./router/Router")

require('./database/connection/connection')


// Enable CORS for all origins and methods
server.use(cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));
 
// Handle preflight requests
server.options('*', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
});

// Increase the limit for JSON payloads
server.use(express.json({ limit: '10mb' })); // Set limit to 10MB

// Increase the limit for URL-encoded payloads
server.use(express.urlencoded({ limit: '10mb', extended: true }));


server.use(Router)

const PORT = process.env.PORT || 3001;

server.get('/',(req,res)=>{
    res.status(200).json("PRODUCTION nexportal server started - Leads")
})

server.listen(PORT,()=>{
    console.log(`PRODUCTION nexportal server Leads started at port : ${PORT}`);

})

// General error handling middleware
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});