import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

export const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});
