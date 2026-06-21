const API_BASE_URL = 'http://localhost:5000/api';

// ─── Token Management ─────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// ─── Session Management ───────────────────────────────────────────
// Verifies token with backend on every page load
// If token is expired or invalid → clears session → redirects to login
export const verifySession = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      // Token invalid or expired — clear session
      clearSession();
      return false;
    }

    const data = await response.json();
    if (data.success) {
      // Refresh user data in localStorage
      setUser(data.user);
      localStorage.setItem('role', data.user.role);
      return true;
    }

    clearSession();
    return false;
  } catch {
    // Server unreachable — don't clear session, just return false
    return false;
  }
};

// Clears all session data
export const clearSession = () => {
  removeToken();
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  localStorage.removeItem('lastVerified');
  clearCache(); // Clear all cached data on logout
};

// ─── Simple In-Memory Cache ─────────────────────────────────────
// Caches GET responses for 30 seconds to avoid redundant network calls
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, time: Date.now() });
};

export const clearCache = () => cache.clear();

// ─── API Request Helper ───────────────────────────────────────────
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

  // Return cached response for GET requests
  const isGet = !options.method || options.method === 'GET';
  if (isGet) {
    const cached = getCached(url);
    if (cached) return cached;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (response.status === 401) {
      clearSession();
      window.location.href = '/candidate/login';
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    // Cache successful GET responses
    if (isGet) setCached(url, data);

    return data;
  } catch (error) {
    throw error;
  }
};

// ─── Module 1: Auth APIs (Srinjoy) ───────────────────────────────

export const login = async (emailOrObj, password, portalRole) => {
  let email;
  if (typeof emailOrObj === 'object') {
    email = emailOrObj.email;
    password = emailOrObj.password;
    portalRole = emailOrObj.portalRole;
  } else {
    email = emailOrObj;
  }
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, portalRole })
  });
  if (data?.token) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('role', data.user.role);
  }
  return data;
};

export const changePassword = async (oldPasswordOrObj, newPassword) => {
  let oldPassword;
  if (typeof oldPasswordOrObj === 'object') {
    oldPassword = oldPasswordOrObj.oldPassword;
    newPassword = oldPasswordOrObj.newPassword;
  } else {
    oldPassword = oldPasswordOrObj;
  }
  return await apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword })
  });
};

export const getProfile = async () => {
  return await apiRequest('/auth/profile');
};

export const forgotPassword = async (emailOrObj) => {
  const email = typeof emailOrObj === 'object' ? emailOrObj.email : emailOrObj;
  return await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const resetPassword = async (token, newPasswordOrObj) => {
  const newPassword = typeof newPasswordOrObj === 'object'
    ? newPasswordOrObj.newPassword
    : newPasswordOrObj;
  return await apiRequest(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ newPassword })
  });
};

export const logout = () => {
  clearSession();
};

// ─── Module 2: Document APIs (Sachi) ─────────────────────────────

export const uploadDocument = async (file, documentType, documentName) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  formData.append('documentName', documentName);
  const result = await apiRequest('/documents/upload', {
    method: 'POST',
    body: formData
  });
  clearCache(); // Clear cache so fresh data loads after upload
  return result;
};

export const getDocuments = async (candidateId = null) => {
  let url = '/documents';
  if (candidateId) url += `?candidateId=${candidateId}`;
  return await apiRequest(url);
};

export const downloadDocument = async (documentId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/documents/download/${documentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (response.status === 401) {
    clearSession();
    window.location.href = '/candidate/login';
    return;
  }
  if (!response.ok) throw new Error('Download failed');
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

export const updateDocument = async (documentId, file) => {
  const formData = new FormData();
  formData.append('document', file);
  return await apiRequest(`/documents/${documentId}`, {
    method: 'PUT',
    body: formData
  });
};

export const deleteDocument = async (documentId) => {
  return await apiRequest(`/documents/${documentId}`, { method: 'DELETE' });
};

export const verifyDocument = async (documentId, status, rejectionReason = null) => {
  const result = await apiRequest(`/documents/${documentId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ status, rejectionReason })
  });
  clearCache(); // Clear cache so HR sees updated status
  return result;
};

export const getAllCandidates = async () => {
  return await apiRequest('/documents/hr/candidates');
};

export const getCandidateDetails = async (candidateId) => {
  return await apiRequest(`/documents/hr/candidate/${candidateId}`);
};

export const getDocumentHistory = async (candidateId) => {
  return await apiRequest(`/history/${candidateId}`);
};

// ─── Module 4: Report APIs (Srinjoy) ─────────────────────────────

export const generateReport = async (candidateId) => {
  return await apiRequest(`/reports/generate/${candidateId}`, { method: 'POST' });
};

export const getReportByCandidate = async (candidateId) => {
  return await apiRequest(`/reports/candidate/${candidateId}`);
};

export const getAllReports = async () => {
  return await apiRequest('/reports');
};

export const downloadReport = async (reportId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/reports/download/${reportId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (response.status === 401) {
    clearSession();
    window.location.href = '/candidate/login';
    return;
  }
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'BGV_Report.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// ─── Default export ───────────────────────────────────────────────
export const api = {
  login, changePassword, getProfile,
  forgotPassword, resetPassword, logout,
  uploadDocument, getDocuments, downloadDocument,
  updateDocument, deleteDocument, verifyDocument,
  getAllCandidates, getCandidateDetails, getDocumentHistory,
  generateReport, getReportByCandidate, getAllReports, downloadReport
};

export default api;
