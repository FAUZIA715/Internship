# HR Workspace

## Overview
HR Workspace is a complete administration module for HR teams to manage candidate document verification and track verification status.

## Features

### Candidate Management
- View all candidates with basic details
- Search candidates by name or email
- Filter by verification status (Pending/Approved/Rejected)
- View complete candidate profile

### Document Verification
- View uploaded documents (Aadhaar, PAN, Degree, Employment, Address)
- Verify degree certificate with one click
- Compare candidate details with document details
- Track document upload status

### Verification Tracking
- Auto-verification status for each document
- HR review with Match/Mismatch options
- Overall verification status
- Generate BGV report
- Download BGV report

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hr/candidates` | Get all candidates |
| GET | `/api/hr/candidates/:id` | Get candidate by ID |
| PUT | `/api/hr/candidates/:id/compare` | Update Match/Mismatch |
| PUT | `/api/hr/candidates/:id/verify-degree` | Verify degree |
| POST | `/api/hr/candidates/:id/generate-report` | Generate report |

## Tech Stack
- Frontend: React.js, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB

## How to Run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev