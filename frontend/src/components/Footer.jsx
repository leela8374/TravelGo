import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">✈ Travel<span>Go</span></div>
            <p>Your all-in-one platform to book buses, trains, flights & hotels across India.</p>
          </div>
          <div className="footer-col">
            <h4>Travel</h4>
            <ul>
              <li>Buses</li><li>Trains</li><li>Flights</li><li>Hotels</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Popular Routes</h4>
            <ul>
              <li>Hyderabad → Bangalore</li>
              <li>Mumbai → Delhi</li>
              <li>Chennai → Kolkata</li>
              <li>Bangalore → Mysuru</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li>Help Center</li><li>Cancellation Policy</li><li>Contact Us</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 TravelGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
