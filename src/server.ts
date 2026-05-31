import "dotenv/config";

import { app } from "./app";
import { prisma } from "./prisma/client";

const PORT = Number(process.env.PORT) || 3333;

async function iniciar() {
  try {
    await prisma.$connect();
    console.log("Banco de dados conectado com sucesso.");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

iniciar();
