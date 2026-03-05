import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './MyBookings.css';

const TYPE_ICONS = { bus: '🚌', train: '🚆', flight: '✈️', hotel: '🏨' };

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const { data } = await getMyBookings();
        setBookings(data.bookings || []);
      } catch {
        setError('Could not load your bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, navigate]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getTitle = (b) => {
    const d = b.details;
    if (b.type === 'hotel') return `${d.item?.name} — ${d.item?.city}`;
    return `${d.item?.origin || d.from} → ${d.item?.destination || d.to}`;
  };

  const getSubtitle = (b) => {
    const d = b.details;
    if (b.type === 'hotel') return `📍 ${d.item?.address}`;
    return `${d.item?.name || d.item?.airline || ''} · Dep: ${d.item?.departure}`;
  };

  return (
    <div className="page bookings-page">
      <div className="container">
        <div className="bookings-header fade-in-up">
          <h2>🎒 My Bookings</h2>
          <p>All your confirmed travel reservations</p>
        </div>

        {loading && <div className="loading-wrap"><div className="spinner" /></div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && bookings.length === 0 && !error && (
          <div className="empty-state">
            <div className="icon">🎒</div>
            <h3>No bookings yet!</h3>
            <p>Start exploring and book your first trip.</p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/')}>
              Explore Now
            </button>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="bookings-count">{bookings.length} booking{bookings.length > 1 ? 's' : ''}</div>
        )}

        <div className="bookings-list">
          {bookings.map((b, i) => (
            <div key={i} className="booking-card card fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="booking-type-icon">{TYPE_ICONS[b.type] || '📋'}</div>
              <div className="booking-body">
                <div className="booking-title">{getTitle(b)}</div>
                <div className="booking-sub">{getSubtitle(b)}</div>
                {b.details.passengers > 1 && (
                  <div className="booking-meta">👥 {b.details.passengers} passengers</div>
                )}
                {b.details.total && (
                  <div className="booking-meta">💰 Total Paid: <strong>₹{b.details.total.toLocaleString()}</strong></div>
                )}
              </div>
              <div className="booking-right">
                <span className="badge badge-success">{b.status}</span>
                <div className="booking-date">{formatDate(b.booked_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
