const mongoose = require('mongoose');

mongoose.connect("mongodb://" + process.env.DB_USER_PASS + "@" + process.env.MONGO_URL + ":27017/circle-project", { authSource: "admin" } )
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("Failed to connect to MongoDB because :", err));
