import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CandidateRegistration from './pages/CandidateRegistration';
import CandidateProfile from './pages/CandidateProfile';
import EditProfile from './pages/EditProfile';
import AllCandidates from './pages/AllCandidates';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<CandidateRegistration />} />
          <Route path="/register" element={<CandidateRegistration />} />
          <Route path="/candidates" element={<AllCandidates />} />
          <Route path="/profile/:email" element={<CandidateProfile />} />
          <Route path="/edit-profile/:email" element={<EditProfile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;