import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { config } from "../config";
import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";
import { LoginInput, RegistroInput } from "../schemas/auth.schema";

const SALT_ROUNDS = 10;

export type JwtPayload = {
  sub: string;
  nome: string;
  email: string;
};

function gerarToken(usuario: { id: string; nome: string; email: string }) {
  const payload: JwtPayload = {
    sub: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

function serializarUsuario(usuario: { id: string; nome: string; email: string; criadoEm?: Date }) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    ...(usuario.criadoEm ? { criadoEm: usuario.criadoEm } : {}),
  };
}

export class AuthController {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, email, senha } = req.body as RegistroInput;

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (usuarioExistente) {
        throw new AppError("E-mail já cadastrado", 409);
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senhaHash,
        },
      });

      const token = gerarToken(usuario);

      res.status(201).json({
        usuario: serializarUsuario(usuario),
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = req.body as LoginInput;

      const usuario = await prisma.usuario.findUnique({
        where: { email },
      });

      if (!usuario) {
        throw new AppError("E-mail ou senha inválidos", 401);
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

      if (!senhaCorreta) {
        throw new AppError("E-mail ou senha inválidos", 401);
      }

      const token = gerarToken(usuario);

      res.json({
        usuario: serializarUsuario(usuario),
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async perfil(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario?.sub;

      if (!usuarioId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuario) {
        throw new AppError("Usuário não encontrado", 404);
      }

      res.json(serializarUsuario(usuario));
    } catch (error) {
      next(error);
    }
  }
}
