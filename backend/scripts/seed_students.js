const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const names = [
  "Anjali Sharma", "Priya Singh", "Riya Patel", "Neha Gupta", "Pooja Das", 
  "Sneha Roy", "Aditi Verma", "Shruti Iyer", "Kavya Reddy", "Isha Nair", 
  "Nidhi Joshi", "Swati Rao", "Megha Mishra", "Kriti Jain", "Aarti Desai",
  "Roshni Kapoor", "Aisha Khan", "Tanya Agarwal", "Divya Menon", "Sanya Malhotra",
  "Kareena Sen", "Anushka Ghosh", "Simran Kaur", "Pallavi Jha", "Ananya Pandey",
  "Nandini Bose", "Radhika Apte", "Shreya Ghoshal", "Tara Sutaria", "Kiara Advani"
];
const years = ["23", "24", "25", "26"];
const branches = ["CS", "EE", "EC", "BT", "CI", "ME", "MT"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPadString(num) {
  return num.toString().padStart(2, '0');
}

async function main() {
  const password = await bcrypt.hash('student123', 10);
  let paidCount = 0;
  let unpaidCount = 0;

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const email = `${name.split(' ')[0].toLowerCase()}${i}@hostel.com`;
    const year = getRandom(years);
    const branch = getRandom(branches);
    const roll = getPadString(Math.floor(Math.random() * 70) + 1);
    const regNo = `${year}${branch}80${roll}`;
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'STUDENT',
        studentProfile: {
          create: {
            enrollmentNo: regNo
          }
        }
      }
    });

    // Roughly 60% chance to be paid
    if (Math.random() > 0.4) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: 5000,
          status: 'COMPLETED',
          razorpayOrderId: 'mock_order_' + Date.now() + i,
          razorpayPaymentId: 'mock_pay_' + Date.now() + i,
        }
      });
      paidCount++;
    } else {
      unpaidCount++;
    }
  }
  console.log(`Seeded ${names.length} girls! (${paidCount} Paid, ${unpaidCount} Unpaid)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
