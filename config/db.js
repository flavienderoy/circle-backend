const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/circle-project")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("Failed to connect to MongoDB because :", err));
