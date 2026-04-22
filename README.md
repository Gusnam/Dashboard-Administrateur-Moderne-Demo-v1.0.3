# 🧠 Admin Dashboard (Full Stack Demo)

A modern **Admin Dashboard** built with a **Node.js (Express) backend**
and a **vanilla HTML/CSS/JS frontend**.

------------------------------------------------------------------------

## 🚀 Project Overview

This project simulates a real-world admin panel where you can: - Manage
users - Create transactions - Generate reports - View statistics - Use a
dark/light theme - Work with protected authenticated pages

⚠️ Runs in **DEV_MODE** (in-memory data, no database)

------------------------------------------------------------------------

## 🏗️ Project Structure

project-root/ ├── backend/ ├── front-end/ └── README.md

------------------------------------------------------------------------

## ⚙️ Backend

-   **app.js** → main server entry
-   **config/devData.js** → fake database (edit here for demo data)
-   **controllers/** → business logic
-   **routes/** → API endpoints
-   **middleware/** → authentication protection

------------------------------------------------------------------------

## 🎨 Frontend

### HTML Pages

-   index.html → dashboard
-   utilisateurs.html → users
-   transactions.html → transactions
-   statistiques.html → stats
-   parametres.html → settings
-   signin.html → login

### CSS

-   global.css → layout + dark/light theme

### JavaScript

-   auth.js → authentication/session
-   api.js → API handler
-   dashboard.js → dashboard logic
-   users.js → users management
-   transactions.js → transactions logic
-   theme.js → theme switcher

------------------------------------------------------------------------

## 🔄 Data Flow

Frontend → JS → API → Backend → devData → Response → UI

------------------------------------------------------------------------

## 🧪 Demo Mode

DEV_MODE=true\
(no database, resets on restart)

------------------------------------------------------------------------

## 🧑‍💻 How to Run

### Backend

cd backend\
npm install\
npm start

### Frontend

http://localhost:3000/HTML/signin.html

### Login

admin@example.com\
Demo1234

------------------------------------------------------------------------

## ⚠️ Important

Do NOT edit data in HTML for logic.\
Edit backend/config/devData.js instead.

------------------------------------------------------------------------

## 💡 Future Improvements

-   Add real database
-   Improve authentication
-   Add charts
-   Pagination
