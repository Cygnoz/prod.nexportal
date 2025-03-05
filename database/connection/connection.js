
// const mongoose = require('mongoose');
// const DB = process.env.DATABASE;

// const connectWithRetry = async () => {
//   try {
//     const conn = await mongoose.connect(DB, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("📡...BillBizz Database Connected Successfully...📡");

//     // Initialize GridFSBucket and assign it to global
//     global.bucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
//       bucketName: "uploads"  // This must match the bucketName in your multer config
//     });
//   } catch (error) {
//     console.error("Database connection error:", error);
//     setTimeout(connectWithRetry, 5000); // Retry connection every 5 seconds
//   }
// };


// connectWithRetry();











const mongoose = require('mongoose');

const DB = process.env.DATABASE;

const connectWithRetry = () => {
  mongoose.connect(DB)
  .then(() => {
    console.log("📡...BillBizz Database Connected Successfully...📡");
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

// const mongoose = require('mongoose');

// const DB = process.env.DATABASE;
// const maxRetries = 5; // Max retry attempts
// const retryDelay = 5000; // Delay between retries in milliseconds


// // Delay function to wait before retrying
// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// const connectWithRetry = async () => {
//   let attempt = 0;

//   while (attempt < maxRetries) {
//     try {
//       // Attempt to connect to the database
//       await mongoose.connect(DB, { 
//         useNewUrlParser: true, 
//         useUnifiedTopology: true,
//       });
      
//       // If successful, log the connection message
//       console.log("📡...BillBizz Database Connected Successfully...📡");
//       break; // Exit the loop once connected

//     } catch (error) {
//       attempt++;
//       console.error(`Connection attempt ${attempt} failed. Error: ${error.message}`);

//       if (attempt < maxRetries) {
//         console.log(`Retrying in ${retryDelay / 1000} seconds...`);
//         await delay(retryDelay); // Wait before retrying
//       } else {
//         console.error("Max retry attempts reached. Could not connect to the database.");
//         throw error; // Throw error after all attempts fail
//       }
//     }
//   }
// };

// connectWithRetry(); // Initial connection attempt





