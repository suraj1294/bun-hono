import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "@/utils/db";

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
