const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const PowerBiData = require("../models/PowerBi");

router.post("/bi", authenticateUser, async (req, res, next) => {
  try {
    const { name, url } = req.body;
    const newBiData = new PowerBiData({ name, url, userId: req.user._id });
    await newBiData.save();
    res.status(201).json({ message: "Power BI URL created successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/get-bi/:userId", authenticateUser, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Forbidden - You are not allowed to access this resource",
      });
    }

    const biUrls = await PowerBiData.find({ userId });
    res.status(200).json({ biUrls });
  } catch (error) {
    next(error);
  }
});

router.delete("/delete-bi/:biId", authenticateUser, async (req, res, next) => {
  try {
    const { biId } = req.params;
    const { _id: userId } = req.user;

    const biData = await PowerBiData.findOne({ _id: biId, userId });

    if (!biData) {
      return res.status(404).json({ message: "Power BI URL not found" });
    }

    await PowerBiData.deleteOne({ _id: biId, userId });

    res.status(200).json({ message: "Power BI URL deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
