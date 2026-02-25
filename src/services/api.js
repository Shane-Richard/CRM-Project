import { API_BASE_URL } from '../constants/endpoints';

/**
 * Universal API Service
 * Handles all outgoing HTTP requests using the Fetch API.
 * Supports GET, POST, PUT, DELETE, and PATCH methods.
 */

// Helper to handle responses
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  let data;
  
  if (contentType && contentType.indexOf("application/json") !== -1) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }

  return data;
};

// Generic request function
const request = async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
    // Add Authorization header here if needed, e.g., using a token from localStorage
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  };

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint, headers) => request(endpoint, 'GET', null, headers),
  post: (endpoint, body, headers) => request(endpoint, 'POST', body, headers),
  put: (endpoint, body, headers) => request(endpoint, 'PUT', body, headers),
  patch: (endpoint, body, headers) => request(endpoint, 'PATCH', body, headers),
  delete: (endpoint, body, headers) => request(endpoint, 'DELETE', body, headers),
};
