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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-shield-alt text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">VeriFlow</h2>
          <p className="text-gray-500 mt-2">Automated Background Verification</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-envelope mr-2 text-gray-400"></i>Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-lock mr-2 text-gray-400"></i>Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" id="rememberMe" className="w-4 h-4 text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {message && (
            <div className={`text-sm rounded-lg p-3 mb-4 ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Reset Password</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <p className="text-gray-600 mb-6">Enter your email to receive a reset link.</p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4"
                placeholder="Enter your email"
                required
              />
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl">
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;