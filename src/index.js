import express from "express";
import "dotenv/config";

import { inngest, functions } from "./inggest/index.js";
import { serve } from "inngest/express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
