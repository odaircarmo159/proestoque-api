import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { autenticar } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginSchema, registroSchema } from "../schemas/auth.schema";

const authRouter = Router();
const controller = new AuthController();

authRouter.post("/registro", validate(registroSchema), controller.registrar.bind(controller));
authRouter.post("/login", validate(loginSchema), controller.login.bind(controller));
authRouter.get("/me", autenticar, controller.perfil.bind(controller));

export { authRouter };
