import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const options = {
      method: "POST",
      url: "https://online-code-compiler.p.rapidapi.com/v1/",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "online-code-compiler.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        language: req.body.language,
        version: req.body.version || "latest",
        code: req.body.script,
        input: req.body.input || null,
      },
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
