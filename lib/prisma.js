"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@prisma/client");
var globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        datasourceUrl: process.env.DATABASE_URL || 'postgresql://postgres.qmqpfgnzxmfrmzboisju:9B%40i8mil!!!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
        log: ['query'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
