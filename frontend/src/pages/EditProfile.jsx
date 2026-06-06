import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const { email } = useParams();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    positionApplied: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/candidates/${email}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            fullName: data.fullName || '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
            phone: data.phone || '',
            address: data.address || '',
            positionApplied: data.positionApplied || '',
            experience: data.experience || ''
          });
        }
      } catch (error) {
        setMessage('Failed to load profile');
      }
    };
    fetchProfile();
  }, [email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/candidates/update/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('✅ Profile updated successfully!');
        setTimeout(() => navigate(`/profile/${email}`), 1500);
      } else {
        setMessage('❌ Update failed');
      }
    } catch (error) {
      setMessage('❌ Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      {/* Admin Badge */}
      <div className="admin-badge">
        <span className="admin-icon">👑</span>
        <span>Admin Portal | Edit Profile</span>
      </div>

      <div className="edit-profile-card">
        <h2>Edit Profile</h2>
        {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Date of Birth *</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Address *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required />
          </div>
          
          <div className="form-group">
            <label>Position Applied *</label>
            <select name="positionApplied" value={formData.positionApplied} onChange={handleChange} required>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Experience *</label>
            <select name="experience" value={formData.experience} onChange={handleChange} required>
              <option value="Fresher">Fresher</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5-8 years">5-8 years</option>
              <option value="8+ years">8+ years</option>
            </select>
          </div>
          
          <div className="button-group">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/profile/${email}`)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;