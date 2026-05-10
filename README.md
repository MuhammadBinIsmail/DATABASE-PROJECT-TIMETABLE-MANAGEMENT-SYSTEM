# Timetable Management System

A full-stack academic scheduling system built with React, Node.js, and MySQL for the Database Systems course at FAST NUCES.

## Group Members
- Muhammad Bin Ismael (24K-0888)
- Safiullah Shaikh (24K-0926)
- Jawad Ali (24K-0907)

## Tech Stack
- **Frontend:** React 18 + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MySQL 8.0 (raw SQL, no ORM)

## Database Features
- 9 normalized tables with foreign key constraints
- 4 triggers (conflict prevention + audit logging)
- 3 SQL views for reporting
- 3 stored procedures
- Transaction-based timetable inserts
- JSON audit trail

## How to Run
1. Run SQL files in order: 01_tables → 02_views → 03_procedures → 04_triggers → 05_seed
2. `cd server && npm install && npm start`
3. `cd client && npm install && npm run dev`
4. Open http://localhost:5173

## Project Files
- `Project_Proposal.pdf` — Project proposal document
- `Project_Report.md` — Full project report
