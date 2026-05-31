import cors from "cors";
import express from "express";

import { errorHandler } from "./middlewares/errorHandler";
import { router } from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", router);
app.use(errorHandler);

export { app };
