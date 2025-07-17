import express, { Request, Response } from "express";
import cors from "cors";
import poolsRouter from "./routes/pools";
import { checkTimeouts } from "./pools";
import { connectDB } from "./db";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/pools", poolsRouter);

// Periodically check for pool timeouts
setInterval(() => {
  checkTimeouts();
}, 10000);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
