import { NextFunction, Request, Response } from "express";

import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";

function getRouteId(req: Request) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    throw new AppError("ID da rota e obrigatorio", 400);
  }

  return id;
}

export class CategoriaController {
  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const categorias = await prisma.categoria.findMany({
        include: {
          produtos: {
            orderBy: { nome: "asc" },
          },
        },
        orderBy: { nome: "asc" },
      });

      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getRouteId(req);

      const categoria = await prisma.categoria.findUnique({
        where: { id },
        include: {
          produtos: {
            orderBy: { nome: "asc" },
          },
        },
      });

      if (!categoria) {
        throw new AppError("Categoria nao encontrada", 404);
      }

      res.json(categoria);
    } catch (error) {
      next(error);
    }
  }
}
