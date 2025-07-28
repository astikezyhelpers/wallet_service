import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

// ✅ Middleware: Auto-update `updated_at`
prisma.$use(async (params, next) => {
  if (['update', 'updateMany'].includes(params.action)) {
    if (!params.args.data) {
      params.args.data = {};
    }

    params.args.data.updated_at = new Date();
  }

  return next(params);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
