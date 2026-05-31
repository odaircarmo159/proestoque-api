import { Router } from "express";

import { categoriaRouter } from "./categoria.routes";
import { produtoRouter } from "./produto.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/produtos", produtoRouter);
router.use("/categorias", categoriaRouter);

export { router };
