import { PrismaClient } from "@prisma/client";

// Ensure Prisma Client is properly initialized
const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Test database connection on startup
if (process.env.NODE_ENV === "development") {
  db.$connect()
    .then(() => {
      console.log("✅ Prisma: Database connection established");
    })
    .catch((error) => {
      console.error("❌ Prisma: Database connection failed:", error.message);
      console.error("Make sure DATABASE_URL is set correctly in your .env file");
    });
}