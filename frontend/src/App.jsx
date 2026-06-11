import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CandidateLogin from './pages/CandidateLogin';
import HRLogin from './pages/HRLogin';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/candidate/login" />} />

        {/* Candidate Portal */}
        <Route path="/candidate/login" element={<CandidateLogin />} />

        {/* HR Portal */}
        <Route path="/hr/login" element={<HRLogin />} />

        {/* Shared auth pages — portalRole from URL decides colors + redirect */}
        <Route path="/:portalRole/change-password" element={<ChangePasswordPage />} />
        <Route path="/:portalRole/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/:portalRole/reset-password/:token" element={<ResetPasswordPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
