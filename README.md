# Memory Game with User Analytics

> **Course Project for ET 617: Educational App Design**
>
> **Assignment:** Web Based System Development
>
> **Submitted by:**
>
> * **Name:** Kalpesh Khare
> * **Roll No:** 22b0069

Welcome to the Memory Game! This is a classic tile-matching memory game built as a full-stack MERN application. It features a complete user authentication system and an advanced analytics dashboard that tracks detailed gameplay statistics for all users.

## Live Demo

You can play the live version of the game here:

**[https://kalpeshkhare7777.github.io/ET617-assignment/](https://kalpeshkhare7777.github.io/ET617-assignment/)**

> **Note:** The free backend hosting on Render may "spin down" after a period of inactivity. The first login or action might take a few extra seconds to wake the server up.

---

## Features

* **User Authentication:** Secure user registration and login system.
* **Classic Memory Game:** A fun and interactive tile-matching game with a clean UI.
* **Game Controls:** Includes Hint, Undo, and Reset functionalities.
* **Advanced Analytics Dashboard:** A comprehensive dashboard that tracks and displays:
    * Overall performance metrics (total games, win rate, average duration).
    * A detailed table of recent game sessions from all players.
    * A toggleable raw action log showing every click, hint, and match attempt.
* **Persistent Data:** All user and game data is permanently stored in a MongoDB database.

---

## Tech Stack

This project was built using the **MERN** stack:

* **Frontend:**
    * **React:** For building the user interface.
    * **CSS:** For custom styling.
* **Backend:**
    * **Node.js:** JavaScript runtime for the server.
    * **Express:** Web framework for creating the API.
    * **MongoDB:** NoSQL database for data storage.
    * **Mongoose:** Object Data Modeling (ODM) library for MongoDB.
    * **bcrypt.js:** For hashing user passwords.

---

## Deployment

This application is deployed in two parts:

* The **Frontend** is a static React application hosted on **GitHub Pages**.
* The **Backend** is a Node.js Express server hosted on **Render**.

---

## Getting Started Locally

To run this project on your own machine, follow these steps:

### Prerequisites

* Node.js and npm installed.
* A MongoDB database connection string (you can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).

### 1. Clone the Repository

```bash
git clone [https://github.com/](https://github.com/)<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Set Up the Backend

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create a .env file in the backend folder and add your MongoDB URI
# MONGO_URI=your_mongodb_connection_string_here

# Start the backend server
node server.js
```
The backend server will be running on `http://localhost:5001`.

### 3. Set Up the Frontend

```bash
# Navigate to the frontend folder from the root directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```
The frontend application will open in your browser at `http://localhost:3000`.
