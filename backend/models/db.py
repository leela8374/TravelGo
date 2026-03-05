from pymongo import MongoClient
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client.get_database("travelgo")

users_col = db["users"]
buses_col = db["buses"]
trains_col = db["trains"]
flights_col = db["flights"]
hotels_col = db["hotels"]
bookings_col = db["bookings"]
