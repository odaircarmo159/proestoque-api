import "dotenv/config";

import { config } from "./config";
import { app } from "./app";
import { prisma } from "./prisma/client";

async function iniciar() {
  try {
    await prisma.$connect();
    console.log("Banco de dados conectado com sucesso.");

    app.listen(config.port, () => {
      console.log(`Servidor rodando em http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

iniciar();
