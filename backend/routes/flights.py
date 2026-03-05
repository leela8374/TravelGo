from flask import Blueprint, request, jsonify
from models.db import flights_col, bookings_col, users_col
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import threading
import random, string

from utils.email import send_ticket_email

flights_bp = Blueprint("flights", __name__)


def _ref():
    return "TGO-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


@flights_bp.route("/search", methods=["GET"])
def search_flights():
    origin      = request.args.get("from", "").strip()
    destination = request.args.get("to",   "").strip()

    if not origin or not destination:
        return jsonify({"error": "from and to are required"}), 400

    query = {
        "origin":      {"$regex": origin,      "$options": "i"},
        "destination": {"$regex": destination, "$options": "i"},
    }
    results = list(flights_col.find(query, {"_id": 0}))
    return jsonify({"results": results, "type": "flight"}), 200


@flights_bp.route("/book", methods=["POST"])
@jwt_required()
def book_flight():
    user_id = get_jwt_identity()
    data    = request.get_json()
    ref     = data.get("booking_ref") or _ref()

    booking = {
        "user_id":     user_id,
        "type":        "flight",
        "details":     data,
        "booking_ref": ref,
        "status":      "confirmed",
        "booked_at":   datetime.utcnow().isoformat(),
    }
    bookings_col.insert_one(booking)
    booking.pop("_id", None)

    user = users_col.find_one({"_id": ObjectId(user_id)})
    if user:
        def _send():
            try:
                send_ticket_email(
                    to_email     = user["email"],
                    user_name    = user["name"],
                    booking_type = "flight",
                    item         = data.get("item", {}),
                    booking_ref  = ref,
                    passengers   = data.get("passengers", 1),
                    total        = data.get("total", 0),
                    date         = data.get("date", ""),
                )
            except Exception as e:
                print(f"[EMAIL ERROR] {e}")
        threading.Thread(target=_send, daemon=True).start()

    return jsonify({"message": "Flight booked successfully!", "booking": booking, "booking_ref": ref}), 201
