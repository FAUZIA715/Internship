import { useState } from "react";
import "./CandidateForm.css";
import { FaUserTie } from "react-icons/fa";

function CandidateForm() {

  const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
});

  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = (e) => {
  e.preventDefault();

  console.log(JSON.stringify(formData, null, 2));
};

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

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Full Name</label>
<input
  type="text"
  name="fullName"
  placeholder="Enter full name"
  value={formData.fullName}
  onChange={handleChange}
/>
          </div>

          <div className="input-group">
            <label>Email</label>
<input
  type="email"
  name="email"
  placeholder="Enter email"
  value={formData.email}
  onChange={handleChange}
/>  
          </div>

          <div className="input-group">
            <label>Phone Number</label>
<input
  type="text"
  name="phone"
  placeholder="Enter phone number"
  value={formData.phone}
  onChange={handleChange}
/>
          </div>

          <div className="input-group">
            <label>Position Applied</label>
<input
  type="text"
  name="position"
  placeholder="Frontend Developer"
  value={formData.position}
  onChange={handleChange}
/>
          </div>

          <div className="input-group">
            <label>Experience</label>
<input
  type="number"
  name="experience"
  placeholder="Years of experience"
  value={formData.experience}
  onChange={handleChange}
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