const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('Getting token:', token ? 'Token exists' : 'No token'); // Debug log
  return token;
};

const setToken = (token) => {
  console.log('Setting token:', token ? 'Token received' : 'No token'); // Debug log
  localStorage.setItem('token', token);
};

const removeToken = () => {
  console.log('Removing token'); // Debug log
  localStorage.removeItem('token');
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Adding auth header for:', endpoint); // Debug log
  }

  const config = {
    ...options,
    headers
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
    config.body = options.body;
  }

  try {
    console.log('Making request to:', url); // Debug log
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log('Response status:', response.status); // Debug log
    console.log('Response data:', data); // Debug log
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============ AUTH API ============
export const login = async (email, password) => {
  console.log('Login attempt for:', email); // Debug log
  
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  console.log('Login response data:', data); // Debug log
  
  if (data.token) {
    setToken(data.token);
    console.log('Token saved successfully'); // Debug log
  } else {
    console.warn('No token in response'); // Debug log
  }
  
  return data;
};

export const logout = () => {
  removeToken();
};

export const getProfile = async () => {
  console.log('Fetching profile...'); // Debug log
  return await apiRequest('/auth/profile');
};

export const isAuthenticated = () => {
  const hasToken = !!getToken();
  console.log('isAuthenticated:', hasToken); // Debug log
  return hasToken;
};

// ============ DOCUMENT API ============
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

export const getDocuments = async (candidateId = null) => {
  let url = '/documents';
  if (candidateId) {
    url += `?candidateId=${candidateId}`;
  }
  return await apiRequest(url);
};

export const getDocumentById = async (documentId) => {
  return await apiRequest(`/documents/${documentId}`);
};

export const downloadDocument = async (documentId) => {
  const token = getToken();
  const url = `${API_BASE_URL}/documents/download/${documentId}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Download failed');
  }
  
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'document';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match) filename = match[1];
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const updateDocument = async (documentId, file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  return await apiRequest(`/documents/${documentId}`, {
    method: 'PUT',
    body: formData
  });
};

export const deleteDocument = async (documentId) => {
  return await apiRequest(`/documents/${documentId}`, {
    method: 'DELETE'
  });
};

// ============ HR SPECIFIC API ============
export const verifyDocument = async (documentId, status, rejectionReason = null) => {
  return await apiRequest(`/documents/${documentId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ status, rejectionReason })
  });
};

export const getAllCandidates = async () => {
  return await apiRequest('/documents/hr/candidates');
};

export const getCandidateDetails = async (candidateId) => {
  return await apiRequest(`/documents/hr/candidate/${candidateId}`);
};

export default {
  login,
  logout,
  getProfile,
  isAuthenticated,
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  verifyDocument,
  getAllCandidates,
  getCandidateDetails
};