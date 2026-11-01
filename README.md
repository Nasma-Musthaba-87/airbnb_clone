# 🏡 StayFinder – Airbnb Clone

StayFinder is a full-stack web application inspired by Airbnb that allows users to explore accommodations, view property details, book stays, and manage their listings. Hosts can create, update, and manage their properties through a dedicated dashboard.

The project was developed using the **MERN Stack (MongoDB, Express.js, React.js, and Node.js)** to demonstrate full-stack web development skills.

## 🌐 Live Demo

**Live Application:** https://airbnb-clone-whdi.onrender.com

## ✨ Features

### 👤 User Authentication

* User registration and login
* JWT-based authentication
* Protected routes
* Role-based access control for guests and hosts

### 🏠 Property Listings

* Browse available accommodations
* Search properties by location
* View detailed property information
* Display property images and pricing
* Filter and sort listings

### 📅 Booking Management

* Book accommodations with check-in and check-out dates
* View personal booking history
* Cancel bookings
* Check booking availability

### ⭐ Reviews & Ratings

* Submit reviews and ratings
* View reviews for properties
* Rating validation

### 🏘️ Host Dashboard

* Become a host
* Create new property listings
* Edit existing listings
* Delete properties
* Manage hosted properties

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* React Router DOM
* Axios
* CSS

### Backend

* Node.js
* Express.js
* RESTful APIs
* JSON Web Token (JWT)
* bcrypt

### Database

* MongoDB
* MongoDB Atlas
* Mongoose

### Deployment

* Render
* GitHub

## 📂 Project Structure

```text
AIRBNB-CLONE/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB Atlas account or local MongoDB
* Git

### 1. Clone the repository

```bash
git clone https://github.com/Nasma-Musthaba-87/airbnb_clone.git
```

### 2. Navigate to the project directory

```bash
cd airbnb_clone
```

### 3. Install backend dependencies

```bash
npm install --prefix backend
```

### 4. Install frontend dependencies

```bash
npm install --prefix frontend
```

### 5. Configure environment variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Replace the placeholder values with your actual configuration.

### 6. Start the backend

```bash
npm run dev --prefix backend
```

Backend runs at:

```text
http://localhost:5000
```

### 7. Start the frontend

Open another terminal:

```bash
npm run dev --prefix frontend
```

Open the Vite URL shown in the terminal, typically:

```text
http://localhost:5173
```

## 🔗 API Endpoints

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| POST   | `/api/auth/register`        | Register a new user        |
| POST   | `/api/auth/login`           | Authenticate user          |
| GET    | `/api/listings`             | Retrieve property listings |
| GET    | `/api/listings/:id`         | Retrieve a property        |
| POST   | `/api/listings`             | Create a property listing  |
| PUT    | `/api/listings/:id`         | Update a property          |
| DELETE | `/api/listings/:id`         | Delete a property          |
| POST   | `/api/bookings`             | Create a booking           |
| GET    | `/api/bookings/my-bookings` | Retrieve user bookings     |
| PATCH  | `/api/bookings/:id/cancel`  | Cancel a booking           |
| POST   | `/api/reviews`              | Submit a review            |
| GET    | `/api/reviews/:listingId`   | Retrieve property reviews  |

*Note: Protected endpoints require JWT authentication. Host-specific operations require host authorization.*

## 🔐 Security Features

* Password hashing using bcrypt
* JWT-based authentication
* Authentication middleware
* Role-based authorization
* Protected API routes
* Environment variables for sensitive configuration

## 🚀 Deployment

The application is deployed on **Render** as a single web service.

* React frontend is built using Vite.
* Express.js serves the frontend production build.
* Backend REST APIs handle application functionality.
* MongoDB Atlas stores application data.

**Live URL:** https://airbnb-clone-whdi.onrender.com

## 🎯 Project Objective

The primary objective of StayFinder is to develop practical experience in full-stack application development, including:

* Frontend development with React
* Backend development with Node.js and Express
* REST API development and integration
* Database management using MongoDB
* Authentication and authorization
* Full-stack deployment
* Version control using Git and GitHub

## 👩‍💻 Author

**Nasma Musthaba**

⭐ If you find this project interesting, feel free to explore the repository!
