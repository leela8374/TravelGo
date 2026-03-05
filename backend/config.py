import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI        = os.getenv("MONGO_URI", "mongodb://localhost:27017/travelgo")
JWT_SECRET_KEY   = os.getenv("JWT_SECRET_KEY", "travelgo-secret-key")
EMAIL_USER       = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD   = os.getenv("EMAIL_PASSWORD", "")
