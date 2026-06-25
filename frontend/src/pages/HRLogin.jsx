import { useEffect } from 'react';

function HRLogin() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'hr') { window.location.replace('/hr/dashboard'); return; }
    if (token && role === 'candidate') { window.location.replace('/candidate/dashboard'); return; }
    window.location.replace('/candidate/login');
  }, []);
  return null;
}

export default HRLogin;