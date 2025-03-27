const mongoose = require('mongoose');

const DB = process.env.DATABASE;

const connectWithRetry = () => {
  mongoose.connect(DB)
  .then(() => {
    console.log("📡...Dev nexportal Database Connected Successfully...📡");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    setTimeout(connectWithRetry, 5000); // Retry connection every 5 seconds
  });
};

connectWithRetry(); // Initial connection attempt

















































// const mongoose = require('mongoose')

// const DB = process.env.DATABASE

// mongoose.connect(DB)
// .then(()=>{
//     console.log("📡...BillBizz Database Connected Succesfully...📡");
// }).catch((error)=>{
//     console.log(`Database error ${error}`);
// })
