import * as schema from "./schema";
import { drizzle } from "drizzle-orm/d1";

export const connect = (db: D1Database) => drizzle(db, { schema });
export type Database = ReturnType<typeof connect>;
