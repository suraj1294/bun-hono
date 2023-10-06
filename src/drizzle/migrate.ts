import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL as string,
});

// or
const _pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "db_name",
});

export const db = drizzle(pool);

async function main() {
  await migrate(db, {
    migrationsFolder: "src/drizzle/migrations",
  });
}

main()
  .then((res) => {
    console.log("Tables migrated!");

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error performing migration: ", err);
    process.exit(1);
  });
