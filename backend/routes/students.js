const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { 
        room: true,
        user: { include: { payments: true } }
      }
    });
    res.json(profile || { nullProfile: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create/Update profile
router.post('/profile', async (req, res) => {
  try {
    const { userId, enrollmentNo } = req.body;
    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: { enrollmentNo },
      create: { userId, enrollmentNo }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-in / Check-out
router.post('/check', async (req, res) => {
  try {
    const { studentProfileId, type, remarks } = req.body; // type: CHECK_IN or CHECK_OUT
    const record = await prisma.checkRecord.create({
      data: {
        studentProfileId,
        type,
        remarks
      }
    });
    res.json({ message: `Successfully logged ${type}`, record });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all check records (Admin)
router.get('/records', async (req, res) => {
  try {
    const records = await prisma.checkRecord.findMany({
      include: { studentProfile: { include: { user: true } } },
      orderBy: { timestamp: 'desc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unallocated profiles (for admin to allocate)
router.get('/unallocated', async (req, res) => {
  try {
    const profiles = await prisma.studentProfile.findMany({
      where: { roomId: null },
      include: { user: true }
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get allocated students who have not completed payment
router.get('/unpaid', async (req, res) => {
  try {
    const allocatedStudents = await prisma.studentProfile.findMany({
      where: { roomId: { not: null } },
      include: { 
        user: { include: { payments: true } },
        room: true
      }
    });

    const unpaidStudents = allocatedStudents.filter(student => {
      const hasPaid = student.user.payments.some(p => p.status === 'COMPLETED');
      return !hasPaid;
    });

    const result = unpaidStudents.map(s => ({
      id: s.id,
      name: s.user.name,
      enrollmentNo: s.enrollmentNo,
      roomNumber: s.room?.roomNumber
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get all students with payment and room info
router.get('/all', async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: { include: { payments: true } },
        room: true
      }
    });
    
    const result = students.map(s => {
      const hasPaid = s.user.payments.some(p => p.status === 'COMPLETED');
      const totalAmount = s.user.payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
      
      return {
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        enrollmentNo: s.enrollmentNo,
        roomNumber: s.room?.roomNumber || 'Unallocated',
        hasPaid,
        paidAmount: totalAmount
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
