import smtplib
import io
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from config import EMAIL_USER, EMAIL_PASSWORD
from routes.ticket import build_ticket


def send_ticket_email(to_email, user_name, booking_type, item, booking_ref, passengers, total, date):
    """Generate a PDF ticket and send it to the user's email as an attachment."""

    # ── Generate PDF ───────────────────────────────────────────
    pdf   = build_ticket(booking_type, item, booking_ref, user_name, passengers, total, date)
    pdf_bytes = pdf.output()

    # ── Build email ────────────────────────────────────────────
    msg = MIMEMultipart()
    msg["From"]    = f"TravelGo <{EMAIL_USER}>"
    msg["To"]      = to_email
    msg["Subject"] = f"TravelGo E-Ticket | {booking_ref} | Your {booking_type.capitalize()} Booking"

    TYPE_ICONS = {"bus": "Bus", "train": "Train", "flight": "Flight", "hotel": "Hotel"}
    travel_label = TYPE_ICONS.get(booking_type, "Travel")

    if booking_type == "hotel":
        trip_line = f"{item.get('name', '')} - {item.get('city', '')}"
    else:
        trip_line = f"{item.get('origin', '')} to {item.get('destination', '')}"

    html_body = f"""
    <html>
    <body style="margin:0;padding:0;background:#0A1628;font-family:Arial,sans-serif;color:#fff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">

        <!-- Header -->
        <tr>
          <td style="background:#0A1628;padding:32px 40px 20px;border-bottom:2px solid #F59E0B;">
            <span style="font-size:26px;font-weight:900;color:#fff;">Travel<span style="color:#F59E0B;">Go</span></span>
            <span style="float:right;background:#F59E0B;color:#0A1628;font-size:11px;font-weight:700;
                         padding:4px 12px;border-radius:20px;margin-top:4px;display:inline-block;">
              E-TICKET
            </span>
          </td>
        </tr>

        <!-- Hero greeting -->
        <tr>
          <td style="background:#112240;padding:32px 40px;">
            <p style="font-size:22px;font-weight:700;margin:0 0 8px;">
              Hi {user_name}! Your booking is confirmed. &#127881;
            </p>
            <p style="color:#8899BB;font-size:14px;margin:0;">
              Your e-ticket is attached to this email as a PDF.
            </p>
          </td>
        </tr>

        <!-- Booking Summary -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="font-size:11px;font-weight:700;color:#F59E0B;text-transform:uppercase;
                       letter-spacing:0.08em;margin:0 0 12px;">Booking Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#112240;border:1px solid #1a3460;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;color:#8899BB;font-size:13px;">
                  Booking Reference
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;font-weight:700;
                            font-size:13px;text-align:right;">
                  {booking_ref}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;color:#8899BB;font-size:13px;">
                  Travel Type
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;font-size:13px;text-align:right;">
                  <span style="background:rgba(245,158,11,0.15);color:#F59E0B;padding:3px 10px;
                                border-radius:20px;font-size:11px;font-weight:700;">
                    {travel_label.upper()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;color:#8899BB;font-size:13px;">
                  Route / Hotel
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;font-weight:600;
                            font-size:13px;text-align:right;">
                  {trip_line}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;color:#8899BB;font-size:13px;">
                  Passengers
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #1a3460;font-size:13px;text-align:right;">
                  {passengers}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;color:#8899BB;font-size:13px;">Total Paid</td>
                <td style="padding:14px 20px;font-weight:700;font-size:16px;color:#F59E0B;text-align:right;">
                  INR {int(total):,}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Note -->
        <tr>
          <td style="padding:24px 40px;">
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);
                        border-radius:10px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#FCD34D;font-weight:600;">
                &#128203; Your PDF ticket is attached
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#8899BB;">
                Please carry a valid photo ID and present your ticket during travel.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0A1628;padding:20px 40px;border-top:1px solid #1a3460;
                     text-align:center;color:#8899BB;font-size:11px;">
            TravelGo &nbsp;|&nbsp; support@travelgo.in &nbsp;|&nbsp; 1800-123-4567 (24x7 Toll Free)
            <br>This is an automated email. Please do not reply.
          </td>
        </tr>

      </table>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_body, "html"))

    # ── Attach PDF ─────────────────────────────────────────────
    pdf_part = MIMEBase("application", "pdf")
    pdf_part.set_payload(pdf_bytes)
    encoders.encode_base64(pdf_part)
    pdf_part.add_header(
        "Content-Disposition",
        f'attachment; filename="TravelGo_Ticket_{booking_ref}.pdf"',
    )
    msg.attach(pdf_part)

    # ── Send via Gmail SMTP ────────────────────────────────────
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USER, to_email, msg.as_string())

    print(f"[EMAIL] Ticket sent to {to_email} | Ref: {booking_ref}")
