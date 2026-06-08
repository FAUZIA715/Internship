import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SendEmail.css';

const SendEmail = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    emailType: 'verification_complete'
  });

  useEffect(() => {
    fetchCandidateDetails();
  }, [email]);

  const fetchCandidateDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/candidates/${email}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
        setEmailData(prev => ({
          ...prev,
          to: data.email
        }));
        setEmailTemplate('verification_complete', data.fullName);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const emailTemplates = {
    verification_complete: (name) => ({
      subject: `Background Verification Complete - ${name}`,
      message: `Dear ${name},\n\nWe are pleased to inform you that your background verification has been successfully completed.\n\n✅ All documents have been verified and approved.\n\nNext Steps:\nOur HR team will contact you shortly to schedule the interview.\n\nThank you for your patience.\n\nBest Regards,\nHR Team\nVeriFlow Verification System`
    }),
    document_request: (name) => ({
      subject: `Document Request - ${name}`,
      message: `Dear ${name},\n\nWe are writing to request additional documents for your background verification.\n\n📄 Required Documents:\n• Clear copy of Aadhaar Card\n• Clear copy of PAN Card\n• Degree Certificate (if available)\n\nPlease upload the requested documents at your earliest convenience.\n\nBest Regards,\nHR Team\nVeriFlow Verification System`
    }),
    interview_call: (name) => ({
      subject: `Interview Call - ${name}`,
      message: `Dear ${name},\n\nCongratulations! Your background verification has been successfully completed.\n\nWe are pleased to invite you for the next round of interview.\n\n📅 Date: To be confirmed\n📍 Mode: Online / Offline\n\nPlease reply to this email confirming your availability.\n\nBest Regards,\nHR Team\nVeriFlow Verification System`
    }),
    rejection: (name) => ({
      subject: `Update on your Application - ${name}`,
      message: `Dear ${name},\n\nThank you for your interest in joining our team.\n\nAfter careful review of your background verification, we regret to inform you that your application cannot be processed further at this time.\n\nWe appreciate your interest and wish you the best in your future endeavors.\n\nBest Regards,\nHR Team\nVeriFlow Verification System`
    }),
    pending: (name) => ({
      subject: `Verification Status Update - ${name}`,
      message: `Dear ${name},\n\nThis is to inform you that some of your documents are still pending verification.\n\n⏳ Pending Items:\n• Aadhaar Card (Pending)\n• PAN Card (Pending)\n\nPlease ensure all documents are uploaded correctly.\n\nBest Regards,\nHR Team\nVeriFlow Verification System`
    })
  };

  const setEmailTemplate = (type, name) => {
    const template = emailTemplates[type](name);
    setEmailData(prev => ({
      ...prev,
      emailType: type,
      subject: template.subject,
      message: template.message
    }));
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setEmailTemplate(type, candidate?.fullName || 'Candidate');
  };

  const handleChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      alert('Please fill both subject and message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailData.to,
          fullName: candidate?.fullName,
          subject: emailData.subject,
          message: emailData.message
        })
      });

      if (response.ok) {
        alert('✅ Email sent successfully!');
        navigate(`/profile/${email}`);
      } else {
        alert('❌ Failed to send email');
      }
    } catch (error) {
      alert('❌ Error sending email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="email-loading">Loading...</div>;
  }

  return (
    <div className="email-composer">
      <div className="email-container">
        <div className="email-header">
          <button className="back-btn" onClick={() => navigate(`/profile/${email}`)}>
            ← Back to Profile
          </button>
          <h1>Send Email to Candidate</h1>
          <p>Compose and send email to {candidate?.fullName}</p>
        </div>

        <div className="email-card">
          {/* Email Type Selection */}
          <div className="form-group">
            <label>Email Template</label>
            <select value={emailData.emailType} onChange={handleTypeChange} className="email-select">
              <option value="verification_complete">✅ Verification Complete</option>
              <option value="document_request">📄 Document Request</option>
              <option value="interview_call">🎯 Interview Call</option>
              <option value="pending">⏳ Pending Verification</option>
              <option value="rejection">❌ Rejection</option>
            </select>
            <p className="helper-text">Select a template - you can edit the subject and message below</p>
          </div>

          {/* To Field */}
          <div className="form-group">
            <label>To:</label>
            <input
              type="email"
              name="to"
              value={emailData.to}
              onChange={handleChange}
              className="email-input"
              disabled
            />
          </div>

          {/* Subject Field */}
          <div className="form-group">
            <label>Subject:</label>
            <input
              type="text"
              name="subject"
              value={emailData.subject}
              onChange={handleChange}
              className="email-input"
              placeholder="Enter email subject"
            />
          </div>

          {/* Message Body */}
          <div className="form-group">
            <label>Message:</label>
            <textarea
              name="message"
              value={emailData.message}
              onChange={handleChange}
              className="email-textarea"
              rows="12"
              placeholder="Write your email message here..."
            />
          </div>

          {/* Send Button */}
          <div className="email-actions">
            <button className="cancel-btn" onClick={() => navigate(`/profile/${email}`)}>
              Cancel
            </button>
            <button className="send-btn" onClick={handleSendEmail} disabled={sending}>
              {sending ? 'Sending...' : '📧 Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmail;