import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidateForm.css';

const CandidateForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    positionApplied: '',
    experience: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'fullName':
        if (!value) error = 'Full name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name can only contain letters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^\d{10}$/.test(value)) error = 'Phone number must be 10 digits';
        break;
      case 'address':
        if (!value) error = 'Address is required';
        else if (value.length < 5) error = 'Address must be at least 5 characters';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setEmailChecking(true);
    try {
      const response = await fetch(`http://localhost:5000/api/candidates/${email}`);
      if (response.status === 200) {
        setEmailAvailable(false);
        setErrors(prev => ({ ...prev, email: 'Email already registered! Use a different email.' }));
      } else {
        setEmailAvailable(true);
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } catch (error) {
      console.error('Error checking email');
    } finally {
      setEmailChecking(false);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setMessage('❌ Please upload PDF, DOC, or DOCX file only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      setResumeName(file.name);
      setMessage('✅ Resume uploaded successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'email') {
      setEmailAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });
    setTouched({ fullName: true, email: true, phone: true, address: true });
    
    if (!isValid) return;
    if (!emailAvailable && formData.email) {
      setMessage('❌ Please use a different email address');
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const response = await fetch('http://localhost:5000/api/candidates/register', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Candidate registered successfully!');
        setFormData({
          fullName: '',
          dateOfBirth: '',
          email: '',
          phone: '',
          address: '',
          positionApplied: '',
          experience: ''
        });
        setResumeFile(null);
        setResumeName('');
        setEmailAvailable(null);
        setErrors({});
        setTouched({});
      } else {
        setMessage(`❌ Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage('❌ Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="candidate-form-container">
      {/* Admin Badge */}
      <div className="admin-badge">
        <span className="admin-icon">👑</span>
        <span>Admin Portal | Candidate Registration</span>
      </div>

      <h2>Candidate Registration</h2>
      <p className="subtitle">Enter candidate information</p>

      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.fullName && errors.fullName ? 'error-input' : ''}
            required
          />
          {touched.fullName && errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label>Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => {
              setTouched(prev => ({ ...prev, email: true }));
              validateField('email', formData.email);
              if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
                checkEmailAvailability(formData.email);
              }
            }}
            className={touched.email && errors.email ? 'error-input' : ''}
            required
          />
          {emailChecking && <span className="info-text">🔍 Checking availability...</span>}
          {touched.email && errors.email && <span className="error-text">{errors.email}</span>}
          {emailAvailable === true && touched.email && !errors.email && <span className="success-text">✓ Email available</span>}
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.phone && errors.phone ? 'error-input' : ''}
            required
          />
          {touched.phone && errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Address *</label>
          <textarea
            name="address"
            placeholder="Enter full address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.address && errors.address ? 'error-input' : ''}
            rows="3"
            required
          />
          {touched.address && errors.address && <span className="error-text">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label>Position Applied *</label>
          <select
            name="positionApplied"
            value={formData.positionApplied}
            onChange={handleChange}
            required
          >
            <option value="">Select position</option>
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
          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
          >
            <option value="">Select experience</option>
            <option value="Fresher">Fresher</option>
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-8 years">5-8 years</option>
            <option value="8+ years">8+ years</option>
          </select>
        </div>

        <div className="form-group">
          <label>📄 Resume / CV (Optional)</label>
          <div className="resume-upload-area">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="resume-input"
            />
            <div className="upload-icon">📄</div>
            <p>Upload PDF, DOC, or DOCX (Max 5MB)</p>
          </div>
          {resumeName && (
            <div className="resume-success">
              ✅ Uploaded: {resumeName}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || emailChecking}>
          {loading ? 'Registering...' : '✨ Register Candidate'}
        </button>
      </form>
    </div>
  );
};

export default CandidateForm;