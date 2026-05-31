import { Router } from "express";

import { CategoriaController } from "../controllers/categoria.controller";

const categoriaRouter = Router();
const controller = new CategoriaController();

categoriaRouter.get("/", controller.listar.bind(controller));
categoriaRouter.get("/:id", controller.buscarPorId.bind(controller));

export { categoriaRouter };
