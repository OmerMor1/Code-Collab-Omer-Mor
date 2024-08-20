import express from "express";
import CodeBlock from "../models/codeBlock.js";
import Hint from "../models/hint.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find().populate("hints");
    res.json(codeBlocks);
  } catch (err) {
    console.error("Error fetching code blocks:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:short_id", async (req, res) => {
  try {
    const codeBlock = await CodeBlock.findOne({
      short_id: req.params.short_id,
    }).populate("hints");
    if (!codeBlock) {
      return res.status(404).json({ error: "Code block not found" });
    }
    res.json(codeBlock);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
