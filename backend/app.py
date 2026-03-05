from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import JWT_SECRET_KEY

from routes.auth import auth_bp
from routes.buses import buses_bp
from routes.trains import trains_bp
from routes.flights import flights_bp
from routes.hotels import hotels_bp
from routes.bookings import bookings_bp
from routes.ticket import ticket_bp

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)
JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(buses_bp, url_prefix="/api/buses")
app.register_blueprint(trains_bp, url_prefix="/api/trains")
app.register_blueprint(flights_bp, url_prefix="/api/flights")
app.register_blueprint(hotels_bp, url_prefix="/api/hotels")
app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
app.register_blueprint(ticket_bp, url_prefix="/api/tickets")


@app.route("/")
def home():
    return {"message": "TravelGo API is running 🚀"}, 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
