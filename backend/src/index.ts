import "dotenv/config";
import cors from "cors";
import express from "express";

import { parseWithAI } from "./aiParser";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.post("/parse", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    return res.status(400).json({ error: "text_required" });
  }

  try {
    const result = await parseWithAI(text);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "parse_failed";
    return res.status(500).json({ error: message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`OptiProfit backend listening on :${port}`);
});
