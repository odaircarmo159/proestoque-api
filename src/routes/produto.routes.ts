import { Router } from "express";

import { ProdutoController } from "../controllers/produto.controller";
import { autenticar } from "../middlewares/auth";

const produtoRouter = Router();
const controller = new ProdutoController();

produtoRouter.use(autenticar);
produtoRouter.get("/", controller.listar.bind(controller));
produtoRouter.get("/:id", controller.buscarPorId.bind(controller));
produtoRouter.post("/", controller.criar.bind(controller));
produtoRouter.put("/:id", controller.atualizar.bind(controller));
produtoRouter.delete("/:id", controller.deletar.bind(controller));
produtoRouter.get("/:id/movimentacoes", controller.listarMovimentacoes.bind(controller));
produtoRouter.post("/:id/movimentacao", controller.registrarMovimentacao.bind(controller));

export { produtoRouter };
