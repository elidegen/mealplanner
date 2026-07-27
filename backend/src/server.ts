import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth.routes";
import { mealsRouter } from "./routes/meals.routes";
import { homesRouter } from "./routes/homes.routes";
import { listsRouter } from "./routes/lists.routes";
import { backfillJoinCodes } from "./services/joinCode";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/meals", mealsRouter);
app.use("/api/homes", homesRouter);
app.use("/api/lists", listsRouter);

app.listen(PORT, async () => {
  await backfillJoinCodes();
  console.log(`API auf http://localhost:${PORT}`);
});
