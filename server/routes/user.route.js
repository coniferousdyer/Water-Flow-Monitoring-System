const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Load model
const User = require("../models/user.model");

// Add a user to the database
router.post("/register", async (req, res) => {
  try {
    // Verify if the user doesn't already exist
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    // Create a new user
    const new_user = new User({
      name: req.body.name,
      email: req.body.email,
    });

    // Hash the password
    const salt = await bcrypt.genSalt();
    new_user.password = await bcrypt.hash(req.body.password, salt);

    // Create and assign a token
    jwt.sign(
      {
        id: new_user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
      async (err, token) => {
        if (err) {
          return res.status(500).json({
            error: "Error signing token",
          });
        }

        // Return the token and the user data
        const saved_user = await new_user.save();
        return res.status(201).json({
          token: token,
          user: {
            name: saved_user.name,
          },
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

// Verify user credentials
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Email not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Incorrect password",
      });
    }

    // Create and assign a token
    jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
      (err, token) => {
        if (err) {
          return res.status(500).json({
            error: "Error signing token",
          });
        }

        // Return the token and the user data
        return res.status(200).json({
          token: token,
          user: {
            name: user.name,
          },
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
