# VeriFlow BGV System — Module 1: Authentication

> **Internship Project** — Aibi Tech | Srinjoy Poddar | June 2026

---

## Overview

Module 1 handles all authentication for the VeriFlow Automated Background Verification System. It provides two separate login portals — one for Candidates and one for HR — with Role Based Access Control (RBAC) enforced at the backend level.

---

## Module Scope

This module is strictly scoped to **Module 1: User & Authentication** as defined in the project scoping document.

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

Create `.env` file in `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
EMAIL=your.gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
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

| Role | Email | Password | Portal |
|---|---|---|---|
| HR | idlikekps@gmail.com | Hr@Veri2026! | localhost:5173/hr/login |
| Candidate | poddarsrinjoy70@gmail.com | Cand@Temp2026! | localhost:5173/candidate/login |

> Note: Candidate has `isFirstLogin: true` — will be forced to change password on first login.

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
✅ .env excluded from git
```

---

## Shared Utilities (for other modules)

This module provides shared utilities that other modules should import:

**`backend/middleware/authMiddleware.js`**
```javascript
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect any route
router.get('/your-route', protect, yourController);

// Restrict to specific role
router.get('/hr-only', protect, authorize('hr'), yourController);
```

---

## Integration Points

| Module | Connection |
|---|---|
| Module 2 (Sachi) | Import `authMiddleware.js` to protect document upload routes |
| Module 3 (Juhi) | Import `authMiddleware.js` to protect verification routes |
| Module 4 (Srinjoy) | Uses `protect` middleware for report generation APIs |
| Module 5.1 (Sachi) | Candidate dashboard at `/candidate/dashboard` — auth redirects here |
| Module 5.2 (Juhi) | HR dashboard at `/hr/dashboard` — auth redirects here |

---

## Developer

**Srinjoy Poddar**
B.Tech CSE (AI/ML) — SMIT Rangpo
Full Stack Intern — Aibi Tech
June 2026
