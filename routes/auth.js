const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

const router = express.Router();
const { v4: uuidv4 } = require("uuid");
// User signup route
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const user = new User({ email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "1d",
    });
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    next(error);
  }
});

// User login route
const urlMap = {}; // In-memory map for demo purposes

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    user.comparePassword(password, function (err, isMatch) {
      if (err) throw err;
      if (!isMatch) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
        expiresIn: "1d",
      });

      // Generate a unique identifier for the user session (for simplicity, using UUID here)
      const userSessionId = uuidv4();

      // Associate the user session identifier with the user's ID
      urlMap[userSessionId] = user._id;

      // Send the user session identifier to the client
      res.send({ message: "Login success", userSessionId });
    });
  } catch (error) {
    next(error);
  }
});

router.get("/redirect/:userSessionId", (req, res) => {
  const userSessionId = req.params.userSessionId;
  console.log("Received userSessionId:", userSessionId);

  // Lookup the user's ID from the server-side storage using the user session identifier
  const userId = urlMap[userSessionId];
  console.log("Mapped userId:", userId);

  if (userId) {
    // Lookup the destination URL based on the user's ID
    const destinationUrl =
      "https://app.powerbi.com/view?r=eyJrIjoiMWZlZWQ0YzctMDcwZi00NjIxLWIxM2YtZWNiYTBkOWM4MTUzIiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9"; // Replace with the actual destination URL

    // Redirect to the actual destination URL
    res.redirect(destinationUrl);
  } else {
    // Handle the case where the user session identifier is not found
    console.log("User session identifier not found");
    res.status(404).send("Not Found");
  }
});



// router.post("/survey", authenticateToken, async (req, res, next) => {
//   try {
//     const userId = req.user.userId;

//     const surveyData = { ...req.body, userId: userId };
//     const survey = new Survey(surveyData);

//     const savedSurvey = await survey.save();

//     res.status(201).json({ message: "Survey saved successfully", survey: savedSurvey });
//   } catch (error) {
//     next(error);
//   }
// });

// function authenticateToken(req, res, next) {
//   const token = req.headers['authorization'];

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: Token not provided" });
//   }

//   jwt.verify(token.replace('Bearer ', ''), config.jwtSecret, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: "Forbidden: Invalid token" });
//     }
//     req.user = user;
//     next();
//   });
// }

module.exports = router;
