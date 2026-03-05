import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('travelgo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);

// ── Search ───────────────────────────────────────────────────
export const searchBuses   = (from, to, date)   => api.get('/buses/search',   { params: { from, to, date } });
export const searchTrains  = (from, to, date)   => api.get('/trains/search',  { params: { from, to, date } });
export const searchFlights = (from, to, date)   => api.get('/flights/search', { params: { from, to, date } });
export const searchHotels  = (city, checkin, checkout) => api.get('/hotels/search', { params: { city, checkin, checkout } });

// ── Booking ──────────────────────────────────────────────────
export const bookBus    = (data) => api.post('/buses/book',   data);
export const bookTrain  = (data) => api.post('/trains/book',  data);
export const bookFlight = (data) => api.post('/flights/book', data);
export const bookHotel  = (data) => api.post('/hotels/book',  data);

// ── My Bookings ──────────────────────────────────────────────
export const getMyBookings = () => api.get('/bookings/');

// ── PDF Ticket ───────────────────────────────────────────────
export const generateTicket = (data) =>
  api.post('/tickets/generate', data, { responseType: 'blob' });

export default api;
