import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const connect = (db: D1Database) => drizzle(db, { schema });
export type Database = ReturnType<typeof connect>;
