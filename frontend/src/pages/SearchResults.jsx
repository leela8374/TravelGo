import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchBuses, searchTrains, searchFlights, searchHotels } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './SearchResults.css';

const TYPE_CONFIG = {
  bus:    { label: 'Buses',   icon: '🚌', color: '#10B981' },
  train:  { label: 'Trains',  icon: '🚆', color: '#3B82F6' },
  flight: { label: 'Flights', icon: '✈️', color: '#8B5CF6' },
  hotel:  { label: 'Hotels',  icon: '🏨', color: '#F59E0B' },
};

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

function getMinPrice(item) {
  if (item.price_per_night) return item.price_per_night;
  if (typeof item.price === 'object') return Math.min(...Object.values(item.price));
  return item.price || 0;
}

export default function SearchResults() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const type       = params.get('type')       || 'bus';
  const from       = params.get('from')       || '';
  const to         = params.get('to')         || '';
  const city       = params.get('city')       || '';
  const date       = params.get('date')       || '';
  const passengers = Number(params.get('passengers') || 1);

  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [sortBy,   setSortBy]   = useState('price');

  // Filter state
  const [maxPrice,    setMaxPrice]    = useState(20000);
  const [minRating,   setMinRating]   = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.bus;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError('');
      try {
        let res;
        if (type === 'bus')    res = await searchBuses(from, to, date);
        if (type === 'train')  res = await searchTrains(from, to, date);
        if (type === 'flight') res = await searchFlights(from, to, date);
        if (type === 'hotel')  res = await searchHotels(city, date, '');
        const data = res.data.results || [];
        setResults(data);
        // Auto-set max price to highest available
        if (data.length > 0) {
          const highest = Math.max(...data.map(getMinPrice));
          setMaxPrice(highest + 500);
        }
      } catch {
        setError('Could not fetch results. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, from, to, city, date]);

  // Compute price range bounds
  const priceBounds = useMemo(() => {
    if (!results.length) return { min: 0, max: 20000 };
    const prices = results.map(getMinPrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [results]);

  // Filter + sort
  const filtered = useMemo(() => {
    let arr = results.filter((item) => {
      const price  = getMinPrice(item);
      const rating = item.rating || 0;
      return price <= maxPrice && rating >= minRating;
    });

    arr.sort((a, b) => {
      if (sortBy === 'price')    return getMinPrice(a) - getMinPrice(b);
      if (sortBy === 'price_d')  return getMinPrice(b) - getMinPrice(a);
      if (sortBy === 'rating')   return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'duration') {
        // parse "Xh Ym" → minutes
        const toMin = (s = '') => {
          const m = s.match(/(\d+)h\s*(\d+)m/);
          return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 999;
        };
        return toMin(a.duration) - toMin(b.duration);
      }
      return 0;
    });
    return arr;
  }, [results, sortBy, maxPrice, minRating]);

  const handleBook = (item) => {
    if (!user) { navigate('/login'); return; }
    navigate('/confirm', { state: { item, type, from, to, city, date, passengers } });
  };

  const getPrice = (item) => {
    if (item.price_per_night) return `₹${item.price_per_night.toLocaleString()}/night`;
    if (typeof item.price === 'object') {
      return Object.entries(item.price).map(([k, v]) => `${k}: ₹${v.toLocaleString()}`).join(' | ');
    }
    return `₹${(item.price || 0).toLocaleString()}`;
  };

  const resetFilters = () => {
    setMaxPrice(priceBounds.max + 500);
    setMinRating(0);
    setSortBy('price');
  };

  return (
    <div className="results-page page">
      <div className="container">
        {/* Header */}
        <div className="results-header fade-in-up">
          <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="results-header-info">
            <h2>
              {cfg.icon}{' '}
              {type === 'hotel' ? `Hotels in ${city}` : `${cfg.label}: ${from} → ${to}`}
            </h2>
            <div className="results-meta">
              {date && <span className="meta-chip">📅 {new Date(date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>}
              {passengers > 1 && <span className="meta-chip">👤 {passengers} Passengers</span>}
            </div>
          </div>

          <div className="results-controls">
            <select
              className="input-field sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">💰 Price: Low to High</option>
              <option value="price_d">💰 Price: High to Low</option>
              <option value="rating">⭐ Rating</option>
              {type !== 'hotel' && <option value="duration">⏱ Duration</option>}
            </select>
            <button
              className={`btn btn-ghost filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              🎛 Filters {showFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Smart Filter Panel */}
        {showFilters && (
          <div className="filter-panel card fade-in-up">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">
                  Max Price: <strong>₹{maxPrice.toLocaleString()}</strong>
                </label>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max + 500}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-slider"
                />
                <div className="slider-labels">
                  <span>₹{priceBounds.min.toLocaleString()}</span>
                  <span>₹{(priceBounds.max + 500).toLocaleString()}</span>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Min Rating: <strong>{minRating > 0 ? `${minRating}+ ⭐` : 'Any'}</strong>
                </label>
                <div className="rating-pills">
                  {[0, 3, 3.5, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`rating-pill ${minRating === r ? 'active' : ''}`}
                      onClick={() => setMinRating(r)}
                    >
                      {r === 0 ? 'Any' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group filter-group-reset">
                <button className="btn btn-ghost" onClick={resetFilters}>↺ Reset</button>
              </div>
            </div>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <p className="loading-text">Searching best options for you...</p>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && results.length === 0 && (
          <div className="empty-state">
            <div className="icon">{cfg.icon}</div>
            <h3>No {cfg.label} Found</h3>
            <p>Try different cities or check back later.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Try Another Search</button>
          </div>
        )}
        {!loading && results.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <div className="icon">🎛</div>
            <h3>No results match your filters</h3>
            <button className="btn btn-ghost" onClick={resetFilters}>↺ Reset Filters</button>
          </div>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <div className="results-count">
            <strong>{filtered.length}</strong> of {results.length} option{results.length > 1 ? 's' : ''} match your filters
          </div>
        )}

        {/* Results */}
        <div className="results-list">
          {filtered.map((item, i) => (
            <div
              key={item.id || i}
              className="result-card card fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="result-main">
                <div className="result-left">
                  {type === 'hotel' ? (
                    <>
                      <div className="result-name">{item.name}</div>
                      <div className="result-sub">📍 {item.address}, {item.city}</div>
                      <div className="result-amenities">
                        {(item.amenities || []).slice(0, 5).map((a) => (
                          <span key={a} className="amenity-tag">{a}</span>
                        ))}
                      </div>
                    </>
                  ) : type === 'train' ? (
                    <>
                      <div className="result-name">
                        {item.name} <span className="train-no">#{item.number}</span>
                      </div>
                      <div className="result-route">
                        <span className="rt-city">{item.origin}</span>
                        <span className="rt-time">{item.departure}</span>
                        <div className="rt-bar"><span className="rt-dur">{item.duration}</span></div>
                        <span className="rt-time">{item.arrival}</span>
                        <span className="rt-city">{item.destination}</span>
                      </div>
                      {item.type && <span className="badge badge-amber">{item.type}</span>}
                    </>
                  ) : (
                    <>
                      <div className="result-name">
                        {item.name || item.airline}{' '}
                        {item.flight_no ? <span className="train-no">({item.flight_no})</span> : ''}
                      </div>
                      {item.type && <span className="result-type-badge badge badge-amber">{item.type}</span>}
                      <div className="result-route">
                        <span className="rt-city">{item.origin}</span>
                        <span className="rt-time">{item.departure}</span>
                        <div className="rt-bar"><span className="rt-dur">{item.duration}</span></div>
                        <span className="rt-time">{item.arrival}</span>
                        <span className="rt-city">{item.destination}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="result-right">
                  <div className="result-rating">
                    <span className="stars">{renderStars(item.rating || 4)}</span>
                    <span className="rating-val">{item.rating}</span>
                  </div>
                  <div className="result-price">{getPrice(item)}</div>
                  {passengers > 1 && type !== 'hotel' && (
                    <div className="total-price">
                      Total: ₹{(getMinPrice(item) * passengers).toLocaleString()}
                    </div>
                  )}
                  <div className="seats-left">
                    {item.available_seats
                      ? `🔥 ${item.available_seats} seats left`
                      : item.available_rooms
                      ? `🔥 ${item.available_rooms} rooms left`
                      : ''}
                  </div>
                  <button className="btn btn-primary book-btn" onClick={() => handleBook(item)}>
                    Book Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
