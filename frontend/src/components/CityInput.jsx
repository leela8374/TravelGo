import { useState, useRef, useEffect } from 'react';
import './CityInput.css';

// All cities available in seed data + major Indian cities
export const CITIES = [
  'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai',
  'Kolkata', 'Mysuru', 'Pune', 'Ahmedabad', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Bhopal', 'Indore',
  'Visakhapatnam', 'Coimbatore', 'Kochi', 'Goa', 'Surat',
  'Vadodara', 'Patna', 'Ranchi', 'Bhubaneswar', 'Thiruvananthapuram',
];

export default function CityInput({ label, placeholder, value, onChange, required }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState(value || '');
  const containerRef          = useRef(null);

  // Sync external value changes (e.g. swap button)
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.length >= 1
    ? CITIES.filter((c) => c.toLowerCase().startsWith(query.toLowerCase()))
    : CITIES.slice(0, 6);

  const select = (city) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
  };

  return (
    <div className="city-input-wrap" ref={containerRef}>
      {label && <label className="input-label">{label}</label>}
      <div className="city-input-box">
        <span className="city-input-icon">📍</span>
        <input
          className="input-field city-field"
          placeholder={placeholder || 'Select city'}
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          required={required}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="city-clear-btn"
            onClick={() => { setQuery(''); onChange(''); setOpen(false); }}
          >×</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className="city-dropdown">
          {filtered.map((city) => (
            <li
              key={city}
              className={`city-option ${city === value ? 'active' : ''}`}
              onMouseDown={() => select(city)}
            >
              <span className="city-dot">📍</span> {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
