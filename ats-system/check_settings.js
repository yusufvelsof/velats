const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  console.log('---COMPANY_DATA_START---');
  console.log(JSON.stringify(company, null, 2));
  console.log('---COMPANY_DATA_END---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
