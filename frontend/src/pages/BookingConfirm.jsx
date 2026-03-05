import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookBus, bookTrain, bookFlight, bookHotel, generateTicket } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './BookingConfirm.css';

const BOOK_FNS = { bus: bookBus, train: bookTrain, flight: bookFlight, hotel: bookHotel };

export default function BookingConfirm() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const [passengers, setPassengers] = useState(1);
  const [seatClass,  setSeatClass]  = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!state?.item) {
    return (
      <div className="page confirm-page">
        <div className="container">
          <div className="empty-state">
            <div className="icon">❌</div>
            <h3>No booking data found.</h3>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  const { item, type, from, to, city, date } = state;

  const getBasePrice = () => {
    if (item.price_per_night) return item.price_per_night;
    if (typeof item.price === 'object') return Object.values(item.price)[0];
    return item.price || 0;
  };
  const total = getBasePrice() * passengers;

  const handleConfirm = async () => {
    setLoading(true); setError('');
    try {
      const bookFn = BOOK_FNS[type];
      const res = await bookFn({ item, from, to, city, date, passengers, seat_class: seatClass, total });

      // Use the server-generated booking ref (same ref used for the email)
      const ref = res.data?.booking_ref || ('TGO-' + Math.random().toString(36).substring(2, 10).toUpperCase());
      setBookingRef(ref);
      setSuccess(true);

      // Auto-download the ticket PDF using the same ref
      await downloadPDF(ref);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (ref) => {
    setPdfLoading(true);
    try {
      const payload = {
        type,
        item,
        user_name: user?.name || 'Passenger',
        passengers,
        total,
        date,
        booking_ref: ref || bookingRef,
      };
      const response = await generateTicket(payload);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.download = `TravelGo_Ticket_${ref || bookingRef}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Silent fail for auto-download — user can retry manually
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Success State ────────────────────────────────────────────
  if (success) {
    return (
      <div className="page confirm-page">
        <div className="container">
          <div className="success-wrap card fade-in-up">
            <div className="success-icon">🎉</div>
            <h2>Booking Confirmed!</h2>
            <p>
              Your <strong>{type}</strong> has been booked successfully.<br />
              Have a wonderful trip!
            </p>

            <div className="success-ref">
              Booking Reference: <strong>{bookingRef}</strong>
            </div>

            {/* PDF Download section */}
            <div className="ticket-download-box">
              <div className="ticket-icon">🎫</div>
              <div className="ticket-info">
                <div className="ticket-title">Your E-Ticket is Ready</div>
                <div className="ticket-sub">
                  {pdfLoading
                    ? '⏳ Generating PDF...'
                    : 'PDF downloaded automatically. Click below to re-download.'}
                </div>
              </div>
              <button
                className="btn btn-primary download-btn"
                onClick={() => downloadPDF()}
                disabled={pdfLoading}
              >
                {pdfLoading ? '⏳ ...' : '📄 Download PDF'}
              </button>
            </div>

            {/* Email sent notice */}
            <div className="email-sent-box">
              📧 A copy of your ticket has been sent to your registered email address.
            </div>

            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
                View My Bookings
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking Form ─────────────────────────────────────────────
  return (
    <div className="page confirm-page">
      <div className="container">
        <div className="confirm-wrap fade-in-up">
          <h2 className="confirm-title">Confirm Your Booking</h2>

          <div className="confirm-grid">
            {/* Summary card */}
            <div className="summary-card card">
              <h3>📋 Booking Summary</h3>
              <div className="summary-rows">
                <div className="sum-row"><span>Type</span><span className="badge badge-amber">{type.toUpperCase()}</span></div>
                {type !== 'hotel' ? (
                  <>
                    <div className="sum-row"><span>From</span><strong>{item.origin}</strong></div>
                    <div className="sum-row"><span>To</span><strong>{item.destination}</strong></div>
                    <div className="sum-row"><span>Departure</span><strong>{item.departure}</strong></div>
                    <div className="sum-row"><span>Arrival</span><strong>{item.arrival}</strong></div>
                    <div className="sum-row"><span>Duration</span><span>{item.duration}</span></div>
                  </>
                ) : (
                  <>
                    <div className="sum-row"><span>Hotel</span><strong>{item.name}</strong></div>
                    <div className="sum-row"><span>City</span><strong>{item.city}</strong></div>
                    <div className="sum-row"><span>Address</span><span>{item.address}</span></div>
                  </>
                )}
                {date && <div className="sum-row"><span>Date</span><strong>{date}</strong></div>}
                <div className="sum-row"><span>Name</span><strong>{item.name || item.airline}</strong></div>
                <div className="sum-row"><span>Rating</span><span>⭐ {item.rating}</span></div>
              </div>
            </div>

            {/* Options card */}
            <div className="options-card card">
              <h3>🎟️ Select Options</h3>

              {type !== 'hotel' && (
                <div className="option-row">
                  <label className="input-label">Number of Passengers</label>
                  <select className="input-field" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
                    {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}

              {typeof item.price === 'object' && (
                <div className="option-row">
                  <label className="input-label">Class / Seat Type</label>
                  <select className="input-field" value={seatClass} onChange={(e) => setSeatClass(e.target.value)}>
                    <option value="">Select class</option>
                    {Object.entries(item.price).map(([k, v]) => (
                      <option key={k} value={k}>{k} — ₹{v.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Price</span>
                  <span>₹{getBasePrice().toLocaleString()}</span>
                </div>
                {type !== 'hotel' && passengers > 1 && (
                  <div className="price-row">
                    <span>× {passengers} passengers</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                )}
                <div className="price-row price-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button className="btn btn-primary confirm-btn" onClick={handleConfirm} disabled={loading}>
                {loading ? '⏳ Confirming...' : '✅ Confirm Booking'}
              </button>
              <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
