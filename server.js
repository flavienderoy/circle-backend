const express = require('express');
const userRoutes = require('./routes/user.routes');
require('dotenv').config({path: "./config/.env"});
require('./config/db');
const app = express();

// routes
app.use('/api/user', userRoutes);

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});