const mongoose = require('mongoose');

mongoose.connect("mongodb://" + process.env.DB_USER_PASS + "@localhost:27017/circle-project", { authSource: "admin" } )
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("Failed to connect to MongoDB because :", err));
