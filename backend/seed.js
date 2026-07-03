const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Upsert Admin
  await prisma.user.upsert({
    where: { email: 'admin@hostel.com' },
    update: {},
    create: {
      email: 'admin@hostel.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Upsert Student
  await prisma.user.upsert({
    where: { email: 'student@hostel.com' },
    update: {},
    create: {
      email: 'student@hostel.com',
      password: studentPassword,
      name: 'Test Student',
      role: 'STUDENT',
    },
  });

  console.log('Successfully created test users!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
