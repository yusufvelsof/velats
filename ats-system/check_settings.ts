import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  console.log('---DATA_START---');
  console.log(JSON.stringify(company, null, 2));
  console.log('---DATA_END---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
