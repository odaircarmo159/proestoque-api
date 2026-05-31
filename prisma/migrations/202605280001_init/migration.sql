PRAGMA foreign_keys=OFF;

CREATE TABLE "categorias" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "icone" TEXT NOT NULL,
  "cor" TEXT NOT NULL,
  "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "usuarios" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

CREATE TABLE "produtos" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "categoriaId" TEXT NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "quantidadeMinima" INTEGER NOT NULL,
  "preco" REAL NOT NULL,
  "unidade" TEXT NOT NULL,
  "observacao" TEXT,
  "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" DATETIME NOT NULL,
  CONSTRAINT "produtos_categoriaId_fkey"
    FOREIGN KEY ("categoriaId")
    REFERENCES "categorias" ("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE "movimentacoes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "produtoId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "observacao" TEXT,
  "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "movimentacoes_produtoId_fkey"
    FOREIGN KEY ("produtoId")
    REFERENCES "produtos" ("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

PRAGMA foreign_keys=ON;
