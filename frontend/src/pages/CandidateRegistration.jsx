import CandidateForm from "../components/CandidateForm";
import { useNavigate } from 'react-router-dom';
import './CandidateRegistration.css';

function CandidateRegistration() {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="back-to-dashboard">
        <button className="back-dashboard-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
      <CandidateForm />
    </div>
  );
}

export default CandidateRegistration;