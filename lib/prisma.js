import { PrismaClient } from "@prisma/client";

// Prevents creating a new PrismaClient on every hot-reload in dev,
// which would exhaust the connection limit on free-tier hosted DBs.
const globalForPrisma = global;

function isConfiguredDatabaseUrl(url) {
  if (!url) return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  return !/mysql:\/\/user:password@host/i.test(trimmed) && !trimmed.includes("<user>") && !trimmed.includes("<password>");
}

function isDatabaseUnavailable(error) {
  if (!error) return false;
  return (
    error.code === "P1001" ||
    error.code === "P2024" ||
    /Can't reach database server|Environment variable not found|database server/i.test(error.message)
  );
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function createFallbackPrisma() {
  return {
    notice: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => {
        throw new Error("DATABASE_URL is not configured. Add it to .env to enable notice storage.");
      },
      update: async () => {
        throw new Error("DATABASE_URL is not configured. Add it to .env to enable notice storage.");
      },
      delete: async () => {
        throw new Error("DATABASE_URL is not configured. Add it to .env to enable notice storage.");
      },
    },
  };
}

function createSafePrismaClient() {
  const client = createPrismaClient();

  return new Proxy(client, {
    get(target, prop) {
      if (prop === "notice") {
        return new Proxy(target.notice, {
          get(targetNotice, method) {
            const original = targetNotice[method];
            if (typeof original !== "function") return original;

            return async (...args) => {
              try {
                return await original.apply(targetNotice, args);
              } catch (error) {
                if (isDatabaseUnavailable(error)) {
                  if (method === "findMany") return [];
                  if (method === "findUnique") return null;
                }

                throw error;
              }
            };
          },
        });
      }

      return target[prop];
    },
  });
}

const hasConfiguredDatabaseUrl = isConfiguredDatabaseUrl(process.env.DATABASE_URL);
const prisma = hasConfiguredDatabaseUrl ? globalForPrisma.prisma || createSafePrismaClient() : createFallbackPrisma();

if (process.env.NODE_ENV !== "production" && hasConfiguredDatabaseUrl) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
