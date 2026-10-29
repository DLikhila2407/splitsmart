# SplitSmart — Full-stack expense splitting app

A portfolio-ready MVP for recording group expenses, calculating net balances, and tracking settlements.

## Stack
- Frontend: React, Vite, React Router, plain CSS
- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- API: REST

## Features
- Register and log in
- Create groups
- Add members by email (members must already have accounts)
- Record equal-split expenses
- View group expense history
- Calculate net balances
- Record settlements
- Responsive dashboard UI

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Run locally

### 1. Backend
```bash
cd server
cp .env.example .env
# Edit .env and set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```
The API runs at http://localhost:5000.

### 2. Frontend
In a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Important
This is an educational MVP, not a production financial service. It does not move money or connect to payment rails. Review security, authorization, validation, and edge cases before real-world use.

## Suggested build milestones
1. Run the app and register two test users.
2. Create a group and add the other user by their registered email.
3. Add expenses and verify that total shares equal the expense amount.
4. Record a settlement and confirm balances update.
5. Add tests, deploy frontend/backend, and document screenshots in the README.
