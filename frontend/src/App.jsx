import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import BookingConfirm from './pages/BookingConfirm';
import MyBookings from './pages/MyBookings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/results"       element={<SearchResults />} />
          <Route path="/confirm"       element={<BookingConfirm />} />
          <Route path="/my-bookings"   element={<MyBookings />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
