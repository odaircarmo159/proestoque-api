import "dotenv/config";

import { prisma } from "./client";

async function main() {
  console.log("Executando seed...");

  const categorias = [
    { id: "bebidas", nome: "Bebidas", icone: "cafe-outline", cor: "#7c3aed" },
    { id: "alimentos", nome: "Alimentos", icone: "fast-food-outline", cor: "#059669" },
    { id: "limpeza", nome: "Limpeza", icone: "sparkles-outline", cor: "#0284c7" },
    { id: "papelaria", nome: "Papelaria", icone: "document-outline", cor: "#db2777" },
    { id: "escritorio", nome: "Escritorio", icone: "briefcase-outline", cor: "#d97706" },
  ];

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { id: categoria.id },
      update: categoria,
      create: categoria,
    });
  }

  const produtos = [
    {
      id: "prod_cafe",
      nome: "Cafe Especial 250g",
      categoriaId: "bebidas",
      quantidade: 4,
      quantidadeMinima: 10,
      preco: 32.9,
      unidade: "un",
      observacao: "Pacote premium para vendas unitarias.",
    },
    {
      id: "prod_arroz",
      nome: "Arroz Branco 5kg",
      categoriaId: "alimentos",
      quantidade: 15,
      quantidadeMinima: 6,
      preco: 29.9,
      unidade: "cx",
      observacao: null,
    },
    {
      id: "prod_sulfite",
      nome: "Papel Sulfite A4",
      categoriaId: "escritorio",
      quantidade: 22,
      quantidadeMinima: 8,
      preco: 34.9,
      unidade: "pct",
      observacao: null,
    },
  ];

  for (const produto of produtos) {
    await prisma.produto.upsert({
      where: { id: produto.id },
      update: produto,
      create: produto,
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
