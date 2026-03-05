import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CityInput from '../components/CityInput';
import './Home.css';

const MODES = [
  { id: 'bus',    label: '🚌 Bus',    color: '#10B981' },
  { id: 'train',  label: '🚆 Train',  color: '#3B82F6' },
  { id: 'flight', label: '✈️ Flight', color: '#8B5CF6' },
  { id: 'hotel',  label: '🏨 Hotel',  color: '#F59E0B' },
];

const FEATURES = [
  { icon: '🔍', title: 'Smart Search',       desc: 'Autocomplete city search with real-time suggestions across all transport types.' },
  { icon: '💰', title: 'Best Prices',        desc: 'Compare and filter by price range to find the best deal every time.' },
  { icon: '⚡', title: 'Instant Booking',    desc: 'Book in seconds — get your e-ticket PDF & email confirmation instantly.' },
  { icon: '🛡️', title: 'Secure & Reliable', desc: 'JWT-protected accounts. Your data and payments are always safe.' },
  { icon: '📱', title: '24/7 Support',       desc: 'Round-the-clock customer support whenever you need help.' },
  { icon: '🗺️', title: 'All-India Coverage', desc: 'Connecting every major city and destination across India.' },
];

const POPULAR = [
  { from: 'Hyderabad', to: 'Bangalore', modes: ['Bus', 'Train', 'Flight'] },
  { from: 'Mumbai',    to: 'Delhi',     modes: ['Train', 'Flight'] },
  { from: 'Chennai',   to: 'Kolkata',   modes: ['Flight'] },
  { from: 'Bangalore', to: 'Mysuru',    modes: ['Bus', 'Train'] },
  { from: 'Hyderabad', to: 'Mumbai',    modes: ['Flight', 'Train'] },
  { from: 'Delhi',     to: 'Jaipur',    modes: ['Bus', 'Train'] },
];

const RECENT_KEY = 'tg_recent_searches';

export default function Home() {
  const navigate = useNavigate();
  const [mode,       setMode]       = useState('bus');
  const [from,       setFrom]       = useState('');
  const [to,         setTo]         = useState('');
  const [date,       setDate]       = useState('');
  const [city,       setCity]       = useState('');
  const [passengers, setPassengers] = useState(1);
  const [recent,     setRecent]     = useState([]);

  const isHotel = mode === 'hotel';

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {}
  }, []);

  const saveRecent = (entry) => {
    try {
      const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const deduped = [entry, ...prev.filter((r) => JSON.stringify(r) !== JSON.stringify(entry))].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(deduped));
      setRecent(deduped);
    } catch {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (isHotel) {
      const entry = { type: 'hotel', city, date, passengers };
      saveRecent(entry);
      navigate(`/results?type=hotel&city=${city}&date=${date}&passengers=${passengers}`);
    } else {
      const entry = { type: mode, from, to, date, passengers };
      saveRecent(entry);
      navigate(`/results?type=${mode}&from=${from}&to=${to}&date=${date}&passengers=${passengers}`);
    }
  };

  const quickSearch = (f, t) => {
    setFrom(f); setTo(t); setMode('bus');
    navigate(`/results?type=bus&from=${f}&to=${t}&date=${date || ''}&passengers=1`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb1" />
          <div className="hero-orb hero-orb2" />
          <div className="hero-orb hero-orb3" />
        </div>

        <div className="container hero-content fade-in-up">
          <div className="hero-badge badge badge-amber">🚀 India's #1 Travel Platform</div>
          <h1>
            Travel Smarter,<br />
            Go <span className="gradient-text">Anywhere</span>
          </h1>
          <p className="hero-sub">
            Book buses, trains, flights, and hotels — all in one place.<br />
            Smart search · Instant tickets · Email delivery
          </p>

          {/* ── Search Box ─────────────────────────── */}
          <div className="search-box card">
            {/* Mode tabs */}
            <div className="mode-tabs">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={`mode-tab ${mode === m.id ? 'active' : ''}`}
                  style={mode === m.id ? { borderColor: m.color, color: m.color } : {}}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              {isHotel ? (
                <div className="search-field">
                  <CityInput
                    label="City"
                    placeholder="e.g. Bangalore"
                    value={city}
                    onChange={setCity}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="search-field">
                    <CityInput
                      label="From"
                      placeholder="Departure city"
                      value={from}
                      onChange={setFrom}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="swap-btn"
                    title="Swap cities"
                    onClick={() => { const t = from; setFrom(to); setTo(t); }}
                  >
                    ⇄
                  </button>

                  <div className="search-field">
                    <CityInput
                      label="To"
                      placeholder="Arrival city"
                      value={to}
                      onChange={setTo}
                      required
                    />
                  </div>
                </>
              )}

              <div className="search-field search-field-sm">
                <label className="input-label">Date</label>
                <input
                  className="input-field"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {!isHotel && (
                <div className="search-field search-field-xs">
                  <label className="input-label">Passengers</label>
                  <select
                    className="input-field"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Pax' : 'Pax'}</option>)}
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary search-btn">
                🔍 Search
              </button>
            </form>

            {/* Recent Searches */}
            {recent.length > 0 && (
              <div className="recent-searches">
                <span className="recent-label">🕘 Recent:</span>
                {recent.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className="recent-chip"
                    onClick={() => {
                      if (r.type === 'hotel') {
                        navigate(`/results?type=hotel&city=${r.city}&date=${r.date}&passengers=${r.passengers}`);
                      } else {
                        navigate(`/results?type=${r.type}&from=${r.from}&to=${r.to}&date=${r.date}&passengers=${r.passengers}`);
                      }
                    }}
                  >
                    {r.type === 'hotel' ? `🏨 ${r.city}` : `${r.from} → ${r.to}`}
                  </button>
                ))}
                <button
                  type="button"
                  className="recent-clear"
                  onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                >
                  ✕ Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────── */}
      <section className="stats-section">
        <div className="container stats-grid">
          {[
            { value: '2M+',  label: 'Happy Travellers' },
            { value: '500+', label: 'Routes Covered' },
            { value: '50+',  label: 'Partner Airlines' },
            { value: '10K+', label: 'Hotels Listed' },
          ].map((s) => (
            <div key={s.label} className="stat-card card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose <span>TravelGo?</span></h2>
            <p>Everything you need for a perfect journey, in one place.</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Routes ─────────────────────────── */}
      <section className="section popular-section">
        <div className="container">
          <div className="section-title">
            <h2>Popular <span>Routes</span></h2>
            <p>Click any card to instantly search that route</p>
          </div>
          <div className="grid-3">
            {POPULAR.map((r) => (
              <div
                key={r.from + r.to}
                className="route-card card"
                onClick={() => quickSearch(r.from, r.to)}
              >
                <div className="route-info">
                  <span className="route-city">{r.from}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-city">{r.to}</span>
                </div>
                <div className="route-modes">
                  {r.modes.map((m) => <span key={m} className="badge badge-amber">{m}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
