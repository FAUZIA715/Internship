import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const navStyle = {
    background: '#1e293b',
    padding: '15px 30px',
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const buttonStyle = {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.2s'
  };

  const buttonHover = {
    background: '#2563eb'
  };

  return (
    <nav style={navStyle}>
      <button 
        style={buttonStyle}
        onMouseEnter={(e) => e.target.style.background = buttonHover.background}
        onMouseLeave={(e) => e.target.style.background = buttonStyle.background}
        onClick={() => navigate('/register')}
      >
        + Register Candidate
      </button>
      <button 
        style={buttonStyle}
        onMouseEnter={(e) => e.target.style.background = buttonHover.background}
        onMouseLeave={(e) => e.target.style.background = buttonStyle.background}
        onClick={() => navigate('/profile')}
      >
        View Profile
      </button>
      <button 
        style={buttonStyle}
        onMouseEnter={(e) => e.target.style.background = buttonHover.background}
        onMouseLeave={(e) => e.target.style.background = buttonStyle.background}
        onClick={() => navigate('/verification-status')}
      >
        Verification Status
      </button>
    </nav>
  );
};

export default Navbar;