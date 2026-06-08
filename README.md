# 👑 Admin Workspace

## Overview
Admin Workspace is a complete administration module for the VeriFlow Automated Background Verification System. It combines Candidate Management, Admin Dashboard, and Email Notification features into one unified interface.

## Features

### ✅ Candidate Management
- **Register Candidate** - Add new candidates with personal details and resume
- **View All Candidates** - Browse all registered candidates in a table view
- **Search Candidates** - Filter candidates by name or email in real-time
- **Edit Candidate** - Update candidate profile information
- **Delete Candidate** - Remove candidate records from the system

### 📄 Document Handling
- **Upload Resume** - Upload candidate resumes (PDF, DOC, DOCX)
- **Download Resume** - Download uploaded resumes for review

### ✅ Verification Status
- **Aadhaar Verification** - Update status (Pending/Verified/Rejected)
- **PAN Verification** - Update status (Pending/Verified/Rejected)
- **Education Verification** - Update status (Pending/Verified/Rejected/Partially Verified)
- **Employment Verification** - Update status (Pending/Verified/Rejected/Partially Verified)
- **Overall Status** - Auto-calculated based on individual verifications

### 🎯 Admin Workspace Features
- **Dashboard Overview** - Stats cards (Total, Verified, Pending, Completion %)
- **Quick Actions** - Register Candidate, View All Candidates, Verification Status, Reports
- **Recent Activity** - List of recent candidates with status
- **Smart Navigation** - Back button remembers where you came from

### 📧 Email Notification System
- **Manual Email** - Admin can send emails to candidates from profile page
- **Email Templates** - 5 pre-defined templates (Verification Complete, Document Request, Interview Call, Pending, Rejection)
- **Email Composer** - Rich editor with subject and message fields
- **Notification History** - Track all sent emails
- **Demo Mode** - Emails logged to console.

## 📊 Dashboard Statistics
- Total candidates count
- Verified candidates count
- Pending candidates count
- Completion percentage

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, CSS (Poppins font)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **File Upload:** Multer
- **Email (Demo):** Console logging (SMTP ready)

## 🔗 API Endpoints

### Candidate APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidates/register` | Register new candidate with resume |
| GET | `/api/candidates` | Get all candidates |
| GET | `/api/candidates/:email` | Get candidate by email |
| PUT | `/api/candidates/update/:email` | Update candidate profile |
| DELETE | `/api/candidates/:email` | Delete candidate |
| GET | `/api/candidates/verification-status/:email` | Get verification status |
| PUT | `/api/candidates/verification/:email` | Update verification status |
| GET | `/api/candidates/resume/:email` | Download resume |

### Notification APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/send` | Send email to candidate |
| GET | `/api/notifications/history` | Get all notification history |
| GET | `/api/notifications/history/:email` | Get history for specific candidate |

## 🚀 How to Run

### Prerequisites
- Node.js installed
- MongoDB installed and running

### Setup
```bash
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev