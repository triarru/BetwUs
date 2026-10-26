import { defineConfig, env } from "prisma/config";

// Prisma CLI does not read .env on its own since v7. Next.js loads it for the app.
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on variables already in the environment.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
