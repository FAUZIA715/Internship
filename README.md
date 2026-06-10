# HR Workspace

## Overview
HR Workspace is a complete solution for HR teams to manage candidate document verification. Auto-verification for Aadhaar, PAN, Address combined with manual HR verification for Degree and Employment.

## Features

### HR Dashboard
- Total candidates, pending reviews, approved, rejected
- Department-wise breakdown
- Quick filter buttons

### Document Verification
- Auto-verification: Aadhaar, PAN, Address
- HR manual verification: Degree, Employment
- View uploaded documents
- Real-time status updates

### Reporting
- Generate BGV report (available after HR approval)
- Download BGV report

## Tech Stack
- Frontend: React.js, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hr/candidates` | Get all candidates |
| GET | `/api/hr/candidates/:id` | Get candidate by ID |
| PUT | `/api/hr/candidates/:id/update-degree` | Update degree status |
| PUT | `/api/hr/candidates/:id/update-employment` | Update employment status |
| POST | `/api/hr/candidates/:id/generate-report` | Generate BGV report |
| POST | `/api/hr/sample-data` | Add sample data |

## How to Run

### Backend
```bash
cd backend
npm install
npm run dev
# Frontend
cd frontend
npm install
npm run dev