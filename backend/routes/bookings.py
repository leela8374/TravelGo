from flask import Blueprint, jsonify
from models.db import bookings_col
from flask_jwt_extended import jwt_required, get_jwt_identity

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.route("/", methods=["GET"])
@jwt_required()
def get_my_bookings():
    user_id = get_jwt_identity()
    bookings = list(bookings_col.find({"user_id": user_id}, {"_id": 0}))
    return jsonify({"bookings": bookings}), 200
