import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";

type ProdutoPayload = {
  nome?: string;
  categoriaId?: string;
  quantidade?: number;
  quantidadeMinima?: number;
  preco?: number;
  unidade?: string;
  observacao?: string;
};

type MovimentacaoPayload = {
  tipo?: string;
  quantidade?: number;
  observacao?: string;
};

function toNullableTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function getRouteId(req: Request) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    throw new AppError("ID da rota e obrigatorio", 400);
  }

  return id;
}

function parseProdutoBody(body: ProdutoPayload) {
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const categoriaId = typeof body.categoriaId === "string" ? body.categoriaId.trim() : "";
  const unidade = typeof body.unidade === "string" ? body.unidade.trim() : "";
  const observacao = toNullableTrimmedString(body.observacao);

  if (nome.length < 2) {
    throw new AppError("Nome deve ter pelo menos 2 caracteres", 400);
  }

  if (!categoriaId) {
    throw new AppError("categoriaId é obrigatório", 400);
  }

  if (!unidade) {
    throw new AppError("unidade é obrigatória", 400);
  }

  const quantidade = Number(body.quantidade);
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    throw new AppError("quantidade deve ser um número inteiro não negativo", 400);
  }

  const quantidadeMinima = Number(body.quantidadeMinima);
  if (!Number.isInteger(quantidadeMinima) || quantidadeMinima < 0) {
    throw new AppError("quantidadeMinima deve ser um número inteiro não negativo", 400);
  }

  const preco = Number(body.preco);
  if (!Number.isFinite(preco) || preco < 0) {
    throw new AppError("preco deve ser um número não negativo", 400);
  }

  return {
    nome,
    categoriaId,
    quantidade,
    quantidadeMinima,
    preco,
    unidade,
    observacao,
  };
}

async function validarCategoria(categoriaId: string) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
  });

  if (!categoria) {
    throw new AppError("Categoria não encontrada", 404);
  }
}

export class ProdutoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const busca = typeof req.query.busca === "string" ? req.query.busca.trim() : "";
      const categoriaId =
        typeof req.query.categoriaId === "string" ? req.query.categoriaId.trim() : "";
      const apenasAlerta = req.query.apenasAlerta === "true";

      const where: Prisma.ProdutoWhereInput = {
        ...(busca
          ? {
              nome: {
                contains: busca,
              },
            }
          : {}),
        ...(categoriaId ? { categoriaId } : {}),
      };

      const produtos = await prisma.produto.findMany({
        where,
        include: { categoria: true },
        orderBy: { nome: "asc" },
      });

      const resultado = apenasAlerta
        ? produtos.filter((produto) => produto.quantidade <= produto.quantidadeMinima)
        : produtos;

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getRouteId(req);

      const produto = await prisma.produto.findUnique({
        where: { id },
        include: {
          categoria: true,
          movimentacoes: {
            orderBy: { criadoEm: "desc" },
          },
        },
      });

      if (!produto) {
        throw new AppError("Produto não encontrado", 404);
      }

      res.json(produto);
    } catch (error) {
      next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = parseProdutoBody(req.body as ProdutoPayload);
      await validarCategoria(data.categoriaId);

      const produto = await prisma.produto.create({
        data,
        include: { categoria: true },
      });

      res.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getRouteId(req);
      const data = parseProdutoBody(req.body as ProdutoPayload);

      const produtoExistente = await prisma.produto.findUnique({
        where: { id },
      });

      if (!produtoExistente) {
        throw new AppError("Produto não encontrado", 404);
      }

      await validarCategoria(data.categoriaId);

      const produto = await prisma.produto.update({
        where: { id },
        data,
        include: { categoria: true },
      });

      res.json(produto);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getRouteId(req);

      const produtoExistente = await prisma.produto.findUnique({
        where: { id },
      });

      if (!produtoExistente) {
        throw new AppError("Produto não encontrado", 404);
      }

      await prisma.produto.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async registrarMovimentacao(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getRouteId(req);
      const body = req.body as MovimentacaoPayload;
      const tipo = typeof body.tipo === "string" ? body.tipo.trim().toLowerCase() : "";
      const quantidade = Number(body.quantidade);
      const observacao = toNullableTrimmedString(body.observacao);

      if (tipo !== "entrada" && tipo !== "saida") {
        throw new AppError("tipo deve ser 'entrada' ou 'saida'", 400);
      }

      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw new AppError("quantidade deve ser um número inteiro maior que zero", 400);
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const produto = await tx.produto.findUnique({
          where: { id },
        });

        if (!produto) {
          throw new AppError("Produto não encontrado", 404);
        }

        const novaQuantidade =
          tipo === "entrada" ? produto.quantidade + quantidade : produto.quantidade - quantidade;

        if (novaQuantidade < 0) {
          throw new AppError("Quantidade insuficiente para realizar a saída", 400);
        }

        const movimentacao = await tx.movimentacao.create({
          data: {
            produtoId: id,
            tipo,
            quantidade,
            observacao,
          },
        });

        const produtoAtualizado = await tx.produto.update({
          where: { id },
          data: {
            quantidade: novaQuantidade,
          },
          include: { categoria: true },
        });

        return { movimentacao, produto: produtoAtualizado };
      });

      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listarMovimentacoes(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getRouteId(req);

      const produto = await prisma.produto.findUnique({
        where: { id },
      });

      if (!produto) {
        throw new AppError("Produto não encontrado", 404);
      }

      const movimentacoes = await prisma.movimentacao.findMany({
        where: { produtoId: id },
        orderBy: { criadoEm: "desc" },
      });

      res.json(movimentacoes);
    } catch (error) {
      next(error);
    }
  }
}
