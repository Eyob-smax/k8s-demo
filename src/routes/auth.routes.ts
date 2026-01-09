import express from "express";
const router = express.Router();

router.post("/sign-up", async (req, res) => {
  try {
    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sign-out", async (req, res) => {
  try {
    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
