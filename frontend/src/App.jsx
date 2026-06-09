import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HRDashboard from './pages/HRDashboard';
import CandidatesList from './pages/CandidatesList';
import CandidateDetails from './pages/CandidateDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HRDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/candidates-list" element={<CandidatesList />} />
        <Route path="/candidate-details/:id" element={<CandidateDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;