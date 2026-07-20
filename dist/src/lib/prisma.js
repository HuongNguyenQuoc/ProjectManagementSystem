import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV } from "../../config/env.js";
const adapter = new PrismaPg({
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
});
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
if (NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
export const connectDatabase = async () => {
    await prisma.$queryRaw `SELECT 1`;
    console.log('Connected to PostgreSQL database via Prisma');
};
export const disconnectDatabase = async () => {
    await prisma.$disconnect();
};
//# sourceMappingURL=prisma.js.map