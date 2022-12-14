const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

// Create express app
const app = express();

// Loading enviroment variables
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup API endpoints
app.use("/users", require("./routes/user.route"));

// Connection to MongoDB
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("MongoDB database connection established successfully!");
    }
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});
