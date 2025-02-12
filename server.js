require('dotenv').config()

const express = require('express')

const cors = require('cors')

const server = express()

const Router = require("./router/Router")

require('./database/connection/connection')

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

const PORT = 3003

server.get('/',(req,res)=>{
    res.status(200).json("Sales and Support server started - Super Admin")
})

server.listen(PORT,()=>{
    console.log(`BillBizz Sales and Support server Super Admin started at port : ${PORT}`);

})

