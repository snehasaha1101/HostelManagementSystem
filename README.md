# Hostel Management System

🚀 **[View Live Demo](https://hostel-management-system-fhgiqxdw2-snehas-projects-520d58ef.vercel.app)** | ⚙️ **[Backend API](https://hostelmanagementsystem-skqq.onrender.com)**

A full-stack, database-driven web application designed to streamline hostel operations. It replaces manual, paper-based processes with an efficient digital platform for room allocation, fee payment tracking, and real-time student check-in/check-out monitoring.


## Features
- **Role-Based Dashboards**: Secure, distinct portals for Admins and Students.
- **Room Allocation System**: Admins can assign unallocated students to rooms while respecting strict capacity limits.
- **Real-Time Check-In/Out Tracking**: Students log their physical movements on their portal, which instantly updates on the Admin dashboard via polling.
- **Payment Integration**: Fee payment portal tracking paid and unpaid statuses.
- **Advanced Data Filtering**: Admins can easily filter rooms by bed availability, and students by payment status.
- **Premium Glassmorphism UI**: Built with pure Vanilla CSS for a sleek, modern, frosted-glass aesthetic.

## Tech Stack
- **Frontend:** React.js, Vite, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL via Prisma ORM
- **Security:** JWT (JSON Web Tokens) Authentication + bcrypt hashing

## How to Run Locally

### 1. Backend Setup
1. Open a terminal and navigate to `/backend`
2. Run `npm install`
3. Ensure you have a `.env` file containing your `DATABASE_URL` and `JWT_SECRET`.
4. Run `npx prisma db push` to generate the tables.
5. Start the server: `node index.js` (Server runs on port 5000)

### 2. Frontend Setup
1. Open a new terminal and navigate to `/frontend`
2. Run `npm install`
3. Start the dev server: `npm run dev`

Open `http://localhost:5173` in your browser to view the application!
