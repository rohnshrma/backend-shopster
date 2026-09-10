import express from "express";

const router = express.Router();

// GET all customers
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;