"""
Seed script — populates MongoDB with sample travel data.
Run once: python seed.py
"""
from models.db import buses_col, trains_col, flights_col, hotels_col

# ─── Clear existing data ───────────────────────────────────────────────────────
buses_col.delete_many({})
trains_col.delete_many({})
flights_col.delete_many({})
hotels_col.delete_many({})

# ─── Buses ────────────────────────────────────────────────────────────────────
buses = [
    {"id": "BUS001", "name": "KPN Travels", "origin": "Hyderabad", "destination": "Bangalore", "departure": "22:00", "arrival": "06:00", "duration": "8h", "seats": 40, "available_seats": 22, "price": 650, "type": "AC Sleeper", "rating": 4.3},
    {"id": "BUS002", "name": "Orange Travels", "origin": "Hyderabad", "destination": "Bangalore", "departure": "21:00", "arrival": "05:30", "duration": "8.5h", "seats": 35, "available_seats": 10, "price": 550, "type": "Non-AC", "rating": 3.9},
    {"id": "BUS003", "name": "APSRTC Express", "origin": "Hyderabad", "destination": "Chennai", "departure": "20:00", "arrival": "05:00", "duration": "9h", "seats": 45, "available_seats": 30, "price": 700, "type": "AC Seater", "rating": 4.1},
    {"id": "BUS004", "name": "SRS Travels", "origin": "Bangalore", "destination": "Mumbai", "departure": "18:00", "arrival": "09:00", "duration": "15h", "seats": 40, "available_seats": 15, "price": 1200, "type": "AC Sleeper", "rating": 4.5},
    {"id": "BUS005", "name": "VRL Travels", "origin": "Mumbai", "destination": "Pune", "departure": "07:00", "arrival": "10:30", "duration": "3.5h", "seats": 50, "available_seats": 35, "price": 250, "type": "AC Seater", "rating": 4.2},
    {"id": "BUS006", "name": "Parveen Travels", "origin": "Chennai", "destination": "Hyderabad", "departure": "21:30", "arrival": "06:30", "duration": "9h", "seats": 40, "available_seats": 18, "price": 720, "type": "AC Sleeper", "rating": 4.0},
    {"id": "BUS007", "name": "Kallada Travels", "origin": "Kochi", "destination": "Bangalore", "departure": "19:00", "arrival": "07:00", "duration": "12h", "seats": 36, "available_seats": 8, "price": 950, "type": "AC Sleeper", "rating": 4.6},
]

# ─── Trains ───────────────────────────────────────────────────────────────────
trains = [
    {"id": "TRN001", "name": "Rajdhani Express", "number": "12429", "origin": "Hyderabad", "destination": "Delhi", "departure": "06:20", "arrival": "10:55+1", "duration": "28h 35m", "price": {"sleeper": 850, "3AC": 2200, "2AC": 3100}, "available_seats": {"sleeper": 120, "3AC": 45, "2AC": 20}, "rating": 4.4},
    {"id": "TRN002", "name": "Shatabdi Express", "number": "12027", "origin": "Hyderabad", "destination": "Bangalore", "departure": "06:00", "arrival": "13:45", "duration": "7h 45m", "price": {"CC": 1050, "EC": 2050}, "available_seats": {"CC": 80, "EC": 30}, "rating": 4.6},
    {"id": "TRN003", "name": "Duronto Express", "number": "12223", "origin": "Mumbai", "destination": "Hyderabad", "departure": "23:55", "arrival": "15:00+1", "duration": "15h 5m", "price": {"sleeper": 620, "3AC": 1650, "2AC": 2350}, "available_seats": {"sleeper": 200, "3AC": 60, "2AC": 25}, "rating": 4.2},
    {"id": "TRN004", "name": "Garib Rath Express", "number": "12589", "origin": "Chennai", "destination": "Bangalore", "departure": "15:30", "arrival": "21:00", "duration": "5h 30m", "price": {"3AC": 860}, "available_seats": {"3AC": 150}, "rating": 4.0},
    {"id": "TRN005", "name": "Intercity Express", "number": "12079", "origin": "Bangalore", "destination": "Mysuru", "departure": "07:10", "arrival": "09:00", "duration": "1h 50m", "price": {"CC": 210, "FC": 340}, "available_seats": {"CC": 180, "FC": 40}, "rating": 4.3},
]

# ─── Flights ──────────────────────────────────────────────────────────────────
flights = [
    {"id": "FLT001", "airline": "IndiGo", "flight_no": "6E-458", "origin": "Hyderabad", "destination": "Bangalore", "departure": "06:00", "arrival": "07:10", "duration": "1h 10m", "price": {"economy": 3200, "business": 8500}, "available_seats": {"economy": 140, "business": 12}, "rating": 4.1},
    {"id": "FLT002", "airline": "Air India", "flight_no": "AI-542", "origin": "Hyderabad", "destination": "Delhi", "departure": "09:15", "arrival": "11:40", "duration": "2h 25m", "price": {"economy": 5800, "business": 14000}, "available_seats": {"economy": 80, "business": 20}, "rating": 4.3},
    {"id": "FLT003", "airline": "Vistara", "flight_no": "UK-811", "origin": "Mumbai", "destination": "Bangalore", "departure": "07:30", "arrival": "09:00", "duration": "1h 30m", "price": {"economy": 4200, "business": 11000}, "available_seats": {"economy": 110, "business": 16}, "rating": 4.6},
    {"id": "FLT004", "airline": "SpiceJet", "flight_no": "SG-115", "origin": "Delhi", "destination": "Mumbai", "departure": "14:20", "arrival": "16:35", "duration": "2h 15m", "price": {"economy": 3800}, "available_seats": {"economy": 160}, "rating": 3.9},
    {"id": "FLT005", "airline": "GoAir", "flight_no": "G8-432", "origin": "Chennai", "destination": "Kolkata", "departure": "11:00", "arrival": "13:25", "duration": "2h 25m", "price": {"economy": 4500}, "available_seats": {"economy": 130}, "rating": 4.0},
    {"id": "FLT006", "airline": "IndiGo", "flight_no": "6E-921", "origin": "Bangalore", "destination": "Hyderabad", "departure": "18:45", "arrival": "19:55", "duration": "1h 10m", "price": {"economy": 3100, "business": 8000}, "available_seats": {"economy": 155, "business": 10}, "rating": 4.2},
    {"id": "FLT007", "airline": "Air India", "flight_no": "AI-108", "origin": "Hyderabad", "destination": "Mumbai", "departure": "08:00", "arrival": "09:45", "duration": "1h 45m", "price": {"economy": 4000, "business": 10500}, "available_seats": {"economy": 90, "business": 18}, "rating": 4.4},
]

# ─── Hotels ───────────────────────────────────────────────────────────────────
hotels = [
    {"id": "HTL001", "name": "Taj Deccan", "city": "Hyderabad", "address": "Road No.1, Banjara Hills", "rating": 4.8, "price_per_night": 8500, "amenities": ["Pool", "Spa", "WiFi", "Gym", "Restaurant"], "available_rooms": 12, "image_url": "https://source.unsplash.com/400x250/?hotel,luxury"},
    {"id": "HTL002", "name": "Lemon Tree Premier", "city": "Hyderabad", "address": "Hitec City", "rating": 4.2, "price_per_night": 3800, "amenities": ["WiFi", "Gym", "Restaurant", "Bar"], "available_rooms": 25, "image_url": "https://source.unsplash.com/400x250/?hotel,modern"},
    {"id": "HTL003", "name": "The Leela Palace", "city": "Bangalore", "address": "23, Airport Road, Kodihalli", "rating": 4.9, "price_per_night": 12000, "amenities": ["Pool", "Spa", "WiFi", "Butler", "Restaurant"], "available_rooms": 8, "image_url": "https://source.unsplash.com/400x250/?hotel,palace"},
    {"id": "HTL004", "name": "Ibis Bengaluru", "city": "Bangalore", "address": "Hosur Road, Electronic City", "rating": 4.0, "price_per_night": 2800, "amenities": ["WiFi", "Restaurant", "Parking"], "available_rooms": 40, "image_url": "https://source.unsplash.com/400x250/?hotel,budget"},
    {"id": "HTL005", "name": "Trident Nariman Point", "city": "Mumbai", "address": "Nariman Point", "rating": 4.7, "price_per_night": 9500, "amenities": ["Pool", "Spa", "WiFi", "Gym", "Sea View", "Restaurant"], "available_rooms": 15, "image_url": "https://source.unsplash.com/400x250/?hotel,sea"},
    {"id": "HTL006", "name": "Hotel Sahar International", "city": "Mumbai", "address": "Near CST Airport", "rating": 3.8, "price_per_night": 2200, "amenities": ["WiFi", "Restaurant", "AC"], "available_rooms": 50, "image_url": "https://source.unsplash.com/400x250/?hotel,budget"},
    {"id": "HTL007", "name": "ITC Grand Chola", "city": "Chennai", "address": "Mount Road, Guindy", "rating": 4.8, "price_per_night": 11000, "amenities": ["Pool", "Spa", "WiFi", "Gym", "Restaurant"], "available_rooms": 10, "image_url": "https://source.unsplash.com/400x250/?hotel,grand"},
    {"id": "HTL008", "name": "Yatri Niwas", "city": "Delhi", "address": "Paharganj, Near New Delhi Railway Station", "rating": 3.5, "price_per_night": 1500, "amenities": ["WiFi", "AC"], "available_rooms": 60, "image_url": "https://source.unsplash.com/400x250/?hotel"},
    {"id": "HTL009", "name": "The Oberoi", "city": "Delhi", "address": "Dr. Zakir Hussain Marg", "rating": 4.9, "price_per_night": 15000, "amenities": ["Pool", "Spa", "WiFi", "Butler", "Gym", "Restaurant"], "available_rooms": 6, "image_url": "https://source.unsplash.com/400x250/?hotel,luxury"},
]

# ─── Insert ────────────────────────────────────────────────────────────────────
buses_col.insert_many(buses)
trains_col.insert_many(trains)
flights_col.insert_many(flights)
hotels_col.insert_many(hotels)

print("✅ Seed data inserted successfully!")
print(f"   Buses  : {len(buses)}")
print(f"   Trains : {len(trains)}")
print(f"   Flights: {len(flights)}")
print(f"   Hotels : {len(hotels)}")
