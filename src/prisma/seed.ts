import "dotenv/config";

import { prisma } from "./client";

async function main() {
  console.log("Executando seed...");

  const categorias = [
    { id: "bebidas", nome: "Bebidas", icone: "cafe-outline", cor: "#7c3aed" },
    { id: "alimentos", nome: "Alimentos", icone: "fast-food-outline", cor: "#059669" },
    { id: "limpeza", nome: "Limpeza", icone: "sparkles-outline", cor: "#0284c7" },
    { id: "papelaria", nome: "Papelaria", icone: "document-outline", cor: "#db2777" },
    { id: "escritorio", nome: "Escritorio", icone: "briefcase-outline", cor: "#d97706" }
  ];

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { id: categoria.id },
      update: categoria,
      create: categoria,
    });
  }

  console.log("Seed finalizado.");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
