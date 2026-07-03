const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { name: 'Test Student' },
    include: { studentProfile: true }
  });

  for (const user of users) {
    if (user.studentProfile) {
      // Delete associated check records
      await prisma.checkRecord.deleteMany({
        where: { studentProfileId: user.studentProfile.id }
      });
      // Delete student profile
      await prisma.studentProfile.delete({
        where: { id: user.studentProfile.id }
      });
    }
    // Delete associated payments
    await prisma.payment.deleteMany({
      where: { userId: user.id }
    });
    // Delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`Successfully deleted user: ${user.name} (${user.email})`);
  }
  
  if (users.length === 0) {
    console.log('No Test Student found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
