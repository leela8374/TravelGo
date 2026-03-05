from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from fpdf import FPDF
from datetime import datetime
import io
import random
import string

ticket_bp = Blueprint("ticket", __name__)


def generate_ref():
    return "TGO-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


class TicketPDF(FPDF):
    def header(self):
        # Deep navy background strip
        self.set_fill_color(10, 22, 40)
        self.rect(0, 0, 210, 40, "F")

        # Brand name
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(245, 158, 11)   # amber
        self.set_xy(12, 10)
        self.cell(0, 10, "TravelGo", ln=False)

        # Tagline
        self.set_font("Helvetica", "", 9)
        self.set_text_color(136, 153, 187)
        self.set_xy(12, 22)
        self.cell(0, 6, "Your All-in-One Travel Platform", ln=False)

        # TICKET label top-right
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(245, 158, 11)
        self.set_xy(140, 14)
        self.cell(58, 8, "E-TICKET", align="R")

        self.ln(30)

    def footer(self):
        self.set_y(-18)
        self.set_fill_color(10, 22, 40)
        self.rect(0, self.get_y() - 2, 210, 22, "F")
        self.set_font("Helvetica", "", 8)
        self.set_text_color(136, 153, 187)
        self.cell(0, 10, "TravelGo | support@travelgo.in | This is an auto-generated ticket, no signature required.", align="C")

    def section_title(self, title):
        self.set_fill_color(17, 34, 64)
        self.set_draw_color(245, 158, 11)
        self.set_line_width(0.6)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(245, 158, 11)
        self.set_fill_color(17, 34, 64)
        self.rect(10, self.get_y(), 190, 9, "FD")
        self.set_xy(14, self.get_y() + 1)
        self.cell(0, 7, title.upper())
        self.ln(12)

    def key_val(self, key, value, bold_val=False):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(136, 153, 187)
        self.set_x(14)
        self.cell(54, 7, key + ":", ln=False)
        if bold_val:
            self.set_font("Helvetica", "B", 9)
        self.set_text_color(230, 240, 255)
        self.cell(0, 7, str(value), ln=True)

    def divider(self):
        self.set_draw_color(30, 52, 96)
        self.set_line_width(0.3)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def big_row(self, left_label, left_val, right_label, right_val):
        y = self.get_y()
        # Left
        self.set_xy(14, y)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(136, 153, 187)
        self.cell(90, 5, left_label)
        self.set_xy(14, y + 5)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(255, 255, 255)
        self.cell(90, 9, left_val)
        # Right
        self.set_xy(104, y)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(136, 153, 187)
        self.cell(90, 5, right_label)
        self.set_xy(104, y + 5)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(255, 255, 255)
        self.cell(90, 9, right_val)
        self.ln(18)

    def status_badge(self, status):
        # Green badge
        self.set_fill_color(16, 185, 129)
        w = 36
        x = (210 - w) / 2
        self.set_xy(x, self.get_y())
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(10, 22, 40)
        self.cell(w, 9, status.upper(), align="C", fill=True)
        self.ln(14)


def build_ticket(booking_type, item, booking_ref, user_name, passengers, total, date):
    pdf = TicketPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Background
    pdf.set_fill_color(10, 22, 40)
    pdf.rect(0, 38, 210, 260, "F")

    # ── Ref + Status ───────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(255, 255, 255)
    pdf.set_x(14)
    pdf.cell(0, 10, f"Booking Reference: {booking_ref}", ln=True)

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(136, 153, 187)
    pdf.set_x(14)
    pdf.cell(0, 6, f"Issued: {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')}", ln=True)

    pdf.ln(3)
    pdf.status_badge("CONFIRMED")

    # ── Passenger Info ─────────────────────────────────────────
    pdf.section_title("Passenger Information")
    pdf.key_val("Passenger Name", user_name, bold_val=True)
    pdf.key_val("Passengers", str(passengers))
    pdf.divider()

    # ── Travel Details ─────────────────────────────────────────
    TYPE_LABELS = {"bus": "[BUS]", "train": "[TRAIN]", "flight": "[FLIGHT]", "hotel": "[HOTEL]"}
    pdf.section_title(f"{TYPE_LABELS.get(booking_type, 'TRAVEL')} DETAILS")

    if booking_type == "hotel":
        pdf.key_val("Hotel Name",  item.get("name", "-"), bold_val=True)
        pdf.key_val("City",        item.get("city", "-"))
        pdf.key_val("Address",     item.get("address", "-"))
        pdf.key_val("Check-in Date", date or "-")
        amenities = ", ".join(item.get("amenities", []))
        if amenities:
            pdf.key_val("Amenities", amenities)
        pdf.key_val("Rating",      f"{item.get('rating', '-')} / 5.0")
    else:
        name = item.get("name") or item.get("airline", "-")
        number = item.get("number") or item.get("flight_no", "")
        pdf.key_val("Operator",    f"{name} {('(' + number + ')') if number else ''}", bold_val=True)

        pdf.ln(4)
        pdf.big_row("FROM", item.get("origin", "-"), "TO", item.get("destination", "-"))

        pdf.key_val("Departure",   item.get("departure", "-"))
        pdf.key_val("Arrival",     item.get("arrival", "-"))
        pdf.key_val("Duration",    item.get("duration", "-"))
        if date:
            pdf.key_val("Travel Date", date)
        if item.get("type"):
            pdf.key_val("Coach / Class", item.get("type"))
        pdf.key_val("Rating",      f"{item.get('rating', '-')} / 5.0")

    pdf.divider()

    # ── Payment ────────────────────────────────────────────────
    pdf.section_title("Payment Summary")
    pdf.key_val("Total Amount Paid", f"INR {int(total):,}", bold_val=True)
    pdf.key_val("Payment Status",   "PAID")
    pdf.divider()

    # ── Important Notes ────────────────────────────────────────
    pdf.section_title("Important Notes")
    notes = [
        "Please carry a valid government-issued photo ID during travel.",
        "Arrive at the boarding point at least 30 minutes before departure.",
        "This e-ticket is valid only for the date and route specified above.",
        "For cancellations or changes, visit My Bookings on TravelGo.",
        "TravelGo helpline: 1800-123-4567 (Toll free, 24x7)",
    ]
    for note in notes:
        pdf.set_x(14)
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(136, 153, 187)
        pdf.cell(5, 6, "-")   # ASCII bullet (safe for Latin-1 fonts)
        pdf.cell(0, 6, note, ln=True)

    return pdf


@ticket_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_ticket():
    data = request.get_json()

    booking_type = data.get("type", "bus")
    item         = data.get("item", {})
    user_name    = data.get("user_name", "Passenger")
    passengers   = data.get("passengers", 1)
    total        = data.get("total", 0)
    date         = data.get("date", "")
    booking_ref  = data.get("booking_ref") or generate_ref()

    pdf = build_ticket(booking_type, item, booking_ref, user_name, passengers, total, date)

    buf = io.BytesIO()
    pdf_bytes = pdf.output()
    buf.write(pdf_bytes)
    buf.seek(0)

    filename = f"TravelGo_Ticket_{booking_ref}.pdf"
    return send_file(
        buf,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )
