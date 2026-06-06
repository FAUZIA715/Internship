# 📋 Candidate Management Module

## Overview
The Candidate Management Module is a core component of the VeriFlow Automated Background Verification System. It enables administrators to manage candidate information, track verification status, and handle candidate documents efficiently.

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

### 🔍 Admin Dashboard Features
- **View Candidate List** - Complete list of all registered candidates
- **Search & Filter** - Quick search by name or email
- **Review Candidate Details** - Complete profile view
- **Update Verification Status** - Admin can update any verification status
- **Real-time Updates** - Status changes reflect immediately

## 📊 Dashboard Statistics
- Total candidates count
- Verified candidates count
- Pending candidates count

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **File Upload:** Multer

## 🔗 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidates/register` | Register new candidate |
| GET | `/api/candidates` | Get all candidates |
| GET | `/api/candidates/:email` | Get candidate by email |
| PUT | `/api/candidates/update/:email` | Update candidate profile |
| DELETE | `/api/candidates/:email` | Delete candidate |
| GET | `/api/candidates/verification-status/:email` | Get verification status |
| PUT | `/api/candidates/verification/:email` | Update verification status |
| GET | `/api/candidates/resume/:email` | Download resume |

## 🚀 How to Run
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev