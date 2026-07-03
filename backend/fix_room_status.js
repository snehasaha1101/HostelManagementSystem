const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany({
    include: { students: true }
  });

  let fixedCount = 0;
  for (const room of rooms) {
    const currentOccupancy = room.students.length;
    let correctStatus = 'AVAILABLE';
    if (currentOccupancy >= room.capacity) {
      correctStatus = 'FULL';
    }

    if (room.status !== correctStatus) {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: correctStatus }
      });
      console.log(`Fixed Room ${room.roomNumber}: changed status to ${correctStatus} (${currentOccupancy}/${room.capacity})`);
      fixedCount++;
    }
  }

  console.log(`Finished fixing room statuses. Total fixed: ${fixedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
