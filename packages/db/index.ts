export * from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const createDatabaseClient = (databaseUrl: string) => {
  const queryClient = postgres(databaseUrl);
  return drizzle(queryClient, { schema });
};

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
