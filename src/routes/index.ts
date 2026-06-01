import { Router } from "express";

import { authRouter } from "./auth.routes";
import { categoriaRouter } from "./categoria.routes";
import { produtoRouter } from "./produto.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/produtos", produtoRouter);
router.use("/categorias", categoriaRouter);

export { router };
