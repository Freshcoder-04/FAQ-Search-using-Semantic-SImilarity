// server/routes/search.ts
import { Router } from "express";
import axios from "axios";

export const searchRouter = Router();

searchRouter.post("/", async (req, res) => {
  const { query, lang } = req.body;
  try {
    const resp = await axios.post("http://localhost:8000/search", {
      query,
      lang
    });
    res.json(resp.data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "semantic engine error" });
  }
});
