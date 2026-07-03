const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roomsToCreate = [];

  // 001 to 040
  for (let i = 1; i <= 40; i++) {
    roomsToCreate.push({ roomNumber: i.toString().padStart(3, '0'), capacity: 2 });
  }

  // 101 to 140
  for (let i = 101; i <= 140; i++) {
    roomsToCreate.push({ roomNumber: i.toString(), capacity: 2 });
  }

  // 201 to 240
  for (let i = 201; i <= 240; i++) {
    roomsToCreate.push({ roomNumber: i.toString(), capacity: 2 });
  }

  // Bulk insert
  const result = await prisma.room.createMany({
    data: roomsToCreate,
    skipDuplicates: true
  });

  console.log(`Successfully created ${result.count} rooms!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
