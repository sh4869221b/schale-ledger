import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export function createDb(database: Parameters<typeof drizzle>[0]) {
  return drizzle(database, { schema });
}
