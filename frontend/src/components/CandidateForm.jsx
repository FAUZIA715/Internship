import "./CandidateForm.css";
import { FaUserTie } from "react-icons/fa";

function CandidateForm() {
  return (
    <div className="candidate-page">
      <div className="candidate-card">
        
    <div className="badge">
      👤 Candidate Registration
    </div>

    <h1>
      <FaUserTie style={{ marginRight: "10px" }} />
      Candidate Profile
    </h1>
        <p className="subtitle">
          Enter candidate information.
        </p>

        <form>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
            />
          </div>

          <div className="input-group">
            <label>Position Applied</label>
            <input
              type="text"
              placeholder="Frontend Developer"
            />
          </div>

          <div className="input-group">
            <label>Experience</label>
            <input
              type="number"
              placeholder="Years of experience"
            />
          </div>

          <div className="input-group">
            <label>Resume</label>
            <input type="file" />
          </div>

          <button className="submit-btn">
            Register Candidate
          </button>

        </form>

      </div>
    </div>
  );
}

export default CandidateForm;