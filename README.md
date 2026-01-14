#  GigFlow – Freelance Marketplace (MERN Stack)

GigFlow is a full-stack freelance marketplace where clients can post gigs and freelancers can bid on projects.  
The platform includes secure authentication, protected routes, real-time bidding workflow, and a modern SaaS-style UI.

Built using **React, Node.js, Express, MongoDB, JWT authentication, and Tailwind CSS**.

---

## Features

- Secure authentication using JWT (HTTP-only cookies)
- Post, browse, and search gigs
- Bid on gigs with real-time status updates
- Gig owner can review and hire freelancers
- “My Bids” dashboard for freelancers
- Protected routes (Create Gig, My Bids)
- Debounced search for smooth UX
- Modern, responsive SaaS UI with Tailwind CSS
- RESTful API with clean backend architecture

---

##  Tech Stack

**Frontend**
- React (Vite)
- React Router v6
- Context API
- Tailwind CSS
- Lucide Icons

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- Cookie-based auth

---

##  Project Architecture

- **Frontend:** UI, routing, API integration
- **Backend:** Authentication, business logic, database access
- **Database:** Users, Gigs, Bids collections

---

##  Authentication Flow

1. User registers or logs in
2. JWT token stored in HTTP-only cookie
3. Protected routes verified using middleware
4. Secure access to posting gigs and bidding

---



##  Run Locally

### Backend
```bash
cd server
npm install
npm run dev

### frontend

cd client
npm install
npm run dev

