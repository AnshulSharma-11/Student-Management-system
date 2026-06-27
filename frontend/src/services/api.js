import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Response interceptor: unwrap data or throw error ─────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

// ── Student API ──────────────────────────────────────────────────
export const studentService = {
  getAll: (params = {}) => api.get('/students', { params }),
  getById: (id)         => api.get(`/students/${id}`),
  create: (data)        => api.post('/students', data),
  update: (id, data)    => api.put(`/students/${id}`, data),
  delete: (id)          => api.delete(`/students/${id}`),
};

// ── Marks API ────────────────────────────────────────────────────
export const marksService = {
  getByStudent: (studentId)              => api.get(`/students/${studentId}/marks`),
  add:          (studentId, data)        => api.post(`/students/${studentId}/marks`, data),
  update:       (studentId, markId, data)=> api.put(`/students/${studentId}/marks/${markId}`, data),
  delete:       (studentId, markId)      => api.delete(`/students/${studentId}/marks/${markId}`),
};

// ── Subjects API ─────────────────────────────────────────────────
export const subjectService = {
  getAll: () => api.get('/subjects'),
};

export default api;
