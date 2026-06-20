# VeriFlow BGV System — Module 1: Authentication

> **Internship Project** — Aibi Tech | Srinjoy Poddar | June 2026

---

## Overview

Module 1 handles all authentication for the VeriFlow Automated Background Verification System. It provides two separate login portals — one for Candidates and one for HR — with Role Based Access Control (RBAC) enforced at the backend level.

---

## Module Scope

| Feature | Description |
|---|---|
| Separate Portals | Candidate portal and HR portal with different UI |
| Role Based Login | RBAC enforced — wrong role on wrong portal is blocked |
| First Login | Forced password change on first login |
| Forgot Password | Sends reset link via real email |
| Reset Password | Secure token with 15 minute expiry |
| Password Policy | Min 8 chars, uppercase, lowercase, number, special character |
| JWT Auth | All protected routes require valid Bearer token |
| Logout | Clears session from localStorage |

---

## Tech Stack

**Backend**
- Node.js + Express v4
- MongoDB Atlas + Mongoose
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- Nodemailer (reset email)

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- React Router DOM v7

---

## Project Structure

```
Internship/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controllers/
│   │   └── authController.js      # Login, change password, forgot/reset password
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verify + RBAC (shared with other modules)
│   ├── models/
│   │   └── User.js                # User schema (candidate / hr roles)
│   ├── routes/
│   │   └── authRoutes.js          # All auth API endpoints
│   ├── utils/
│   │   ├── seeder.js              # Creates test users
│   │   └── sendEmail.js           # Nodemailer email utility
│   ├── server.js                  # Express app entry point
│   ├── .env                       # Environment variables (not in git)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── CandidateLogin.jsx      # Candidate portal login
    │   │   ├── HRLogin.jsx             # HR portal login
    │   │   ├── ChangePasswordPage.jsx  # First login forced change + strength meter
    │   │   ├── ForgotPasswordPage.jsx  # Request reset link via email
    │   │   └── ResetPasswordPage.jsx   # Reset with token from email
    │   ├── utils/
    │   │   └── api.js                  # Centralized API calls
    │   ├── App.jsx                     # Routes
    │   ├── index.css                   # Global styles
    │   └── main.jsx                    # React entry point
    ├── index.html
    └── package.json
```

---

## API Endpoints

Base URL: `http://localhost:5000/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Login for candidate or HR |
| PUT | `/change-password` | Protected | Change password (forced on first login) |
| GET | `/profile` | Protected | Get logged in user profile |
| POST | `/forgot-password` | Public | Send reset link via email |
| POST | `/reset-password/:token` | Public | Reset password using token |

---

## Password Policy

All passwords must meet the following requirements:

```
✅ Minimum 8 characters
✅ At least one uppercase letter (A-Z)
✅ At least one lowercase letter (a-z)
✅ At least one number (0-9)
✅ At least one special character (!@#$%^&*)
```

Validated at both **frontend** (live strength indicator) and **backend** level.

---

## RBAC — Role Based Access Control

| Portal | Allowed Role | Blocked Role |
|---|---|---|
| `/candidate/login` | candidate | hr |
| `/hr/login` | hr | candidate |

Wrong role on wrong portal returns `403 Access Denied`.

---

## Frontend Routes

| URL | Page | Description |
|---|---|---|
| `/` | Redirect | Redirects to `/candidate/login` |
| `/candidate/login` | CandidateLogin | Candidate portal |
| `/hr/login` | HRLogin | HR portal |
| `/:portalRole/change-password` | ChangePasswordPage | Forced on first login |
| `/:portalRole/forgot-password` | ForgotPasswordPage | Request reset email |
| `/:portalRole/reset-password/:token` | ResetPasswordPage | Reset with email token |

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Gmail account with App Password

### Backend Setup

```bash
cd backend
npm install
```

Seed the database (creates test users):

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Test Credentials

> Run `npm run seed` in backend before testing

---

## Security Features

```
✅ bcrypt password hashing (salt rounds: 10)
✅ JWT token (7 day expiry)
✅ RBAC — role enforced at backend level
✅ Protected routes via middleware
✅ First login forced password change
✅ Forgot password blocked for unactivated accounts
✅ Reset token expires in 15 minutes
✅ Reset token cleared after single use
✅ Strong password policy enforced at both ends

## Developer

**Srinjoy Poddar**
Full Stack Intern — Aibi Tech
June 2026
