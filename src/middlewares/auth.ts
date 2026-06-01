import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import type { JwtPayload } from "../controllers/auth.controller";
import { config } from "../config";
import { AppError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function autenticar(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token não fornecido", 401);
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Token inválido", 401);
    }

    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.usuario = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Token inválido", 401));
  }
}
