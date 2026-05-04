import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const templates = await prisma.emailTemplate.findMany({
    select: { slug: true, name: true }
  });
  console.log(JSON.stringify(templates, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
