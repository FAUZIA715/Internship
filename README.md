# Automated Background Verification System

## Module 2: Candidate Management System

### Features
- Candidate Registration with Resume Upload
- View/Edit/Delete Candidates
- Search Candidates by Name/Email
- Verification Status Tracking (Aadhaar, PAN, Education, Employment)
- Dashboard with Analytics

### Tech Stack
- Frontend: React.js, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- File Upload: Multer

### How to Run
1. Backend: `cd backend && npm run dev`
2. Frontend: `cd frontend && npm run dev`
3. MongoDB must be running

### APIs (Tested with Postman) ✅

| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/api/candidates/register` | ✅ Working |
| GET | `/api/candidates` | ✅ Working |
| GET | `/api/candidates/:email` | ✅ Working |
| PUT | `/api/candidates/update/:email` | ✅ Working |
| DELETE | `/api/candidates/:email` | ✅ Working |
| GET | `/api/candidates/verification-status/:email` | ✅ Working |
| PUT | `/api/candidates/verification/:email` | ✅ Working |

### Status
✅ Module 2 Complete  
✅ All APIs Tested  
✅ Ready for Integration

### Branch
`candidate-management`