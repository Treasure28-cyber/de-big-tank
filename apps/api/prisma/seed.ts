import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await ConfigModule.forRoot({ envFilePath: resolve(__dirname, '../.env') });
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are required to seed an administrator.');
  }

  await prisma.admin.upsert({
    where: { email },
    update: { name: process.env.INITIAL_ADMIN_NAME ?? 'De Big Tank Admin', passwordHash: await bcrypt.hash(password, 12), isActive: true },
    create: { name: process.env.INITIAL_ADMIN_NAME ?? 'De Big Tank Admin', email, passwordHash: await bcrypt.hash(password, 12) },
  });
}

main().finally(() => prisma.$disconnect());
