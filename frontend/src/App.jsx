import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ─── Module 1: Authentication (Srinjoy) ──────────────────────────
import CandidateLogin from './pages/CandidateLogin';
import HRLogin from './pages/HRLogin';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ─── Module 5.1: Candidate Dashboard (Sachi) ─────────────────────
// Sachi: import your CandidateDashboard component here after merge
// import CandidateDashboard from './components/Dashboard';

// ─── Module 5.2: HR Dashboard (Juhi) ─────────────────────────────
// Juhi: import your HRDashboard component here after merge
// import HRDashboard from './pages/HRDashboard';

// ─── Module 5.3: Admin Dashboard (Juhi) ──────────────────────────
// Juhi: import your AdminDashboard component here after merge
// import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/candidate/login" />} />

        {/* ── Module 1: Auth Pages (Srinjoy) ── */}
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/:portalRole/change-password" element={<ChangePasswordPage />} />
        <Route path="/:portalRole/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/:portalRole/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ── Module 5.1: Candidate Dashboard (Sachi) ── */}
        {/* Redirected from: /candidate/login after successful login */}
        {/* Sachi: uncomment after merge */}
        {/* <Route path="/candidate/dashboard" element={<CandidateDashboard />} /> */}

        {/* ── Module 5.2: HR Dashboard (Juhi) ── */}
        {/* Redirected from: /hr/login after successful login */}
        {/* Juhi: uncomment after merge */}
        {/* <Route path="/hr/dashboard" element={<HRDashboard />} /> */}

        {/* ── Module 5.3: Admin Dashboard (Juhi) ── */}
        {/* Juhi: uncomment after merge */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
