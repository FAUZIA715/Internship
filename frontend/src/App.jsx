import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const remember = localStorage.getItem('remember');
    if (remember === 'true' && savedEmail) {
      setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    setTimeout(() => {
      if (email === 'admin@veriflow.com' && password === 'admin123') {
        if (document.getElementById('rememberMe')?.checked) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
          localStorage.setItem('remember', 'true');
        }
        setMessage('✅ Admin login successful!');
        setTimeout(() => alert('Welcome to Admin Dashboard'), 500);
      } 
      else if (email === 'candidate@veriflow.com' && password === 'cand123') {
        if (document.getElementById('rememberMe')?.checked) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
          localStorage.setItem('remember', 'true');
        }
        setMessage('✅ Candidate login successful!');
        setTimeout(() => alert('Welcome to Candidate Dashboard'), 500);
      }
      else {
        setMessage('❌ Invalid credentials');
      }
      setLoading(false);
    }, 1000);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const token = Math.random().toString(36).substring(2, 20);
    localStorage.setItem(`reset_${resetEmail}`, token);
    console.log(`Reset link: http://localhost:5173/reset-password.html?token=${token}&email=${resetEmail}`);
    alert(`Reset link sent to ${resetEmail}! Check console for demo link.`);
    setShowModal(false);
    setResetEmail('');
  };

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
