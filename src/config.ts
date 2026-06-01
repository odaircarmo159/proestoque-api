function getEnvVar(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Variável de ambiente faltando: ${key}`);
  }

  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3333),
  databaseUrl: getEnvVar("DATABASE_URL"),
  jwtSecret: getEnvVar("JWT_SECRET"),
  jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN"),
  nodeEnv: process.env.NODE_ENV ?? "development",
};

export { getEnvVar };
