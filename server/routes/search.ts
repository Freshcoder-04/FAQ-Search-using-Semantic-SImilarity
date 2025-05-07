import { Router } from "express";
import axios from "axios";

export const searchRouter = Router();

searchRouter.post("/", async (req, res) => {
  const { query, lang, top_k } = req.body;
  try {
    // include top_k if provided, fallback in Python to default
    const resp = await axios.post("http://localhost:8000/search", {
      query,
      lang,
      top_k,
    });
    // Python now returns { results: [ ... ] }
    res.json(resp.data.results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "semantic engine error" });
  }
});