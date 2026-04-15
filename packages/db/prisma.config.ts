import path from "node:path";
import { defineConfig } from "prisma/config";

const prismaGenerateUrl =
  process.env.DATABASE_URL ??
  "postgresql://prisma:prisma@127.0.0.1:5432/prisma";

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma/migrations"),
    seed: path.join(__dirname, "prisma/seed.ts"),
  },
  datasource: {
    // Prisma Client generation does not need a live database connection.
    url: prismaGenerateUrl,
  },
});
