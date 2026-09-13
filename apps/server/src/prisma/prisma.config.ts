import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Set it in apps/server/.env before running Prisma commands.",
  );
}

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: databaseUrl,
    },
  }),
});
