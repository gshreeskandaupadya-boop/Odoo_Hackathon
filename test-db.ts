import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "./prisma/contract.json" with { type: "json" };

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});

const runtime = await db.connect();

const result = await runtime.query`SELECT current_user, current_database()`;

console.log(result);

await runtime.close();