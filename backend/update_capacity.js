const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.room.updateMany({
    data: { capacity: 3 }
  });

  console.log(`Successfully updated capacity to 3 for ${result.count} rooms!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
