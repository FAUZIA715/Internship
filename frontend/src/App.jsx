import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import CandidateRegistration from './pages/CandidateRegistration';
import CandidateProfile from './pages/CandidateProfile';
import EditProfile from './pages/EditProfile';
import AllCandidates from './pages/AllCandidates';
import SendEmail from './pages/SendEmail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/register" element={<CandidateRegistration />} />
          <Route path="/candidates" element={<AllCandidates />} />
          <Route path="/profile/:email" element={<CandidateProfile />} />
          <Route path="/edit-profile/:email" element={<EditProfile />} />
          <Route path="/send-email/:email" element={<SendEmail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;