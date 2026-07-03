const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: { students: { include: { user: true } } }
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a room (Admin)
router.post('/', async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;
    const room = await prisma.room.create({
      data: { roomNumber, capacity: capacity || 2 }
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Allocate student to room
router.post('/:id/allocate', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { studentProfileId } = req.body;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { students: true }
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.students.length >= room.capacity) return res.status(400).json({ error: 'Room is full' });

    const updatedProfile = await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { roomId }
    });

    // If room is now full, update status
    if (room.students.length + 1 >= room.capacity) {
      await prisma.room.update({
        where: { id: roomId },
        data: { status: 'FULL' }
      });
    }

    res.json({ message: 'Student allocated', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
