import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HRDashboard from './pages/HRDashboard';
import CandidatesList from './pages/CandidatesList';
import CandidateDetails from './pages/CandidateDetails';


// ─── Module 1: Authentication (Srinjoy) ──────────────────────────
import CandidateLogin from './pages/CandidateLogin';
import HRLogin from './pages/HRLogin';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ─── Module 5.1: Candidate Dashboard (Sachi) ─────────────────────
// Sachi's Dashboard.js handles candidate view
// Route: /candidate/dashboard
// After merge: copy Sachi's Dashboard.js to src/pages/CandidateDashboard.jsx
// import CandidateDashboard from './pages/CandidateDashboard';

// ─── Module 5.2: HR Dashboard (Juhi) ─────────────────────────────
// Juhi's HRDashboard.jsx handles HR view
// Route: /hr/dashboard
// After merge: copy Juhi's HRDashboard.jsx to src/pages/HRDashboard.jsx
// import HRDashboard from './pages/HRDashboard';

// NOTE: Sachi's HRDashboard.js is NOT connected here
// HR Dashboard belongs to Juhi (Module 5.2)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HRDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/candidates-list" element={<CandidatesList />} />
        <Route path="/candidate-details/:id" element={<CandidateDetails />} />

      
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/candidate/login" />} />

        {/* ── Module 1: Auth Pages (Srinjoy) ── */}
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/:portalRole/change-password" element={<ChangePasswordPage />} />
        <Route path="/:portalRole/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/:portalRole/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ── Module 5.1: Candidate Dashboard (Sachi) ── */}
        {/* Redirected here after candidate login */}
        {/* Uncomment after merge with Sachi's branch */}
        {/* <Route path="/candidate/dashboard" element={<CandidateDashboard />} /> */}

        {/* ── Module 5.2: HR Dashboard (Juhi) ── */}
        {/* Redirected here after HR login */}
        {/* Uncomment after merge with Juhi's branch */}
        {/* <Route path="/hr/dashboard" element={<HRDashboard />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
