const API_BASE_URL = 'http://localhost:5000/api';

// ============ TOKEN MANAGEMENT ============
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// ============ API REQUEST HELPER ============
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
    config.body = options.body;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============ AUTH APIs (Srinjoy's Module) ============

// Login
export const login = async (email, password, portalRole) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, portalRole })
  });
  
  if (data.token) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
};

// Change Password
export const changePassword = async (oldPassword, newPassword) => {
  return await apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword })
  });
};

// Get Profile
export const getProfile = async () => {
  return await apiRequest('/auth/profile');
};

// Forgot Password
export const forgotPassword = async (email) => {
  return await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

// Reset Password
export const resetPassword = async (token, newPassword) => {
  return await apiRequest(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ newPassword })
  });
};

// Logout
export const logout = () => {
  removeToken();
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};

// ============ DOCUMENT MODULE APIs ============

// Upload document
export const uploadDocument = async (file, documentType, documentName) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  formData.append('documentName', documentName);
  
  return await apiRequest('/documents/upload', {
    method: 'POST',
    body: formData
  });
};

// Get all documents
export const getDocuments = async (candidateId = null) => {
  let url = '/documents';
  if (candidateId) {
    url += `?candidateId=${candidateId}`;
  }
  return await apiRequest(url);
};

// Download document
export const downloadDocument = async (documentId) => {
  const token = getToken();
  const response = await fetch(`http://localhost:5000/api/documents/download/${documentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Download failed');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Update document
export const updateDocument = async (documentId, file) => {
  const formData = new FormData();
  formData.append('document', file);
  return await apiRequest(`/documents/${documentId}`, {
    method: 'PUT',
    body: formData
  });
};

// Delete document
export const deleteDocument = async (documentId) => {
  return await apiRequest(`/documents/${documentId}`, {
    method: 'DELETE'
  });
};

// Verify document (HR only)
export const verifyDocument = async (documentId, status, rejectionReason = null) => {
  return await apiRequest(`/documents/${documentId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ status, rejectionReason })
  });
};

// Get all candidates (HR view)
export const getAllCandidates = async () => {
  return await apiRequest('/documents/hr/candidates');
};

// Get candidate details
export const getCandidateDetails = async (candidateId) => {
  return await apiRequest(`/documents/hr/candidate/${candidateId}`);
};

// Get document history
export const getDocumentHistory = async (candidateId) => {
  return await apiRequest(`/history/${candidateId}`);
};

// ============ DEFAULT EXPORT ============
export default {
  login,
  changePassword,
  getProfile,
  forgotPassword,
  resetPassword,
  logout,
  uploadDocument,
  getDocuments,
  downloadDocument,
  updateDocument,
  deleteDocument,
  verifyDocument,
  getAllCandidates,
  getCandidateDetails,
  getDocumentHistory
};