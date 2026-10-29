# SplitSmart — Expense Splitting App

SplitSmart is a web application that helps people manage shared expenses with friends, roommates, or groups. Users can create groups, add members, record expenses, and check who owes money and how much.

I built this project to practice full-stack web development and understand how frontend interfaces, backend APIs, databases, and authentication work together.

## Features

- Create an account and log in securely.
- Create groups for shared expenses.
- Add group members using their registered email addresses.
- Record expenses and split them equally among group members.
- View the expense history for each group.
- Check the net balance between members.
- Record settlements and keep track of payments made between members.
- Use the application through a responsive dashboard.

## Technologies Used

- **Frontend:** React, Vite, React Router, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT and bcrypt
- **API:** REST

## Running the Project Locally

### Requirements

Make sure you have Node.js 18 or later and access to a MongoDB database, either locally or through MongoDB Atlas.

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_REPOSITORY_NAME
```

### 2. Start the backend

```bash
cd server
npm install
```

Create a `.env` file based on `.env.example` and add your MongoDB connection string and JWT secret.

Start the server:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`.

### 3. Start the frontend

Open another terminal from the project directory and run:

```bash
cd client
npm install
npm run dev
```

Open the local URL shown in the terminal. Vite usually uses `http://localhost:5173`.

## Project Structure

```text
SplitSmart/
├── client/     # Frontend application
├── server/     # Backend API
└── README.md
```

## Note

SplitSmart is an educational project and does not process actual payments.