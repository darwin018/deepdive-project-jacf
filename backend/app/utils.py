from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Hash:
    @staticmethod
    def bcrypt(password: str):
        return pwd_context.hash(password)

    @staticmethod
    def verify(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

def send_new_order_email(order, products_details):
    """
    Sends an email to the admin summarising a newly placed order.
    `products_details` is a list of dictionaries with keys: name, quantity, price, line_total
    """
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")
    admin_email = os.getenv("ADMIN_EMAIL")

    if not all([sender_email, sender_password, admin_email]):
        print("WARNING: Email credentials not fully configured in .env. Skipping admin notification.")
        return

    msg = EmailMessage()
    msg['Subject'] = f"New Order Received! [Order #{order.id}]"
    msg['From'] = sender_email
    msg['To'] = admin_email

    # Construct HTML Body line by line to avoid multi-line f-string syntax issues
    html_lines = [
        "<html>",
        "  <body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>",
        f"    <h2 style='color: #2563EB;'>New Order #{order.id}</h2>",
        "    <p>A new order has been placed on the DeepDive store.</p>",
        "    <h3 style='border-bottom: 2px solid #eee; padding-bottom: 5px;'>Customer Details</h3>",
        "    <p>",
        f"      <strong>Name:</strong> {order.name}<br>",
        f"      <strong>WhatsApp:</strong> {order.whatsapp_number}<br>",
        f"      <strong>Shipping Address:</strong> {order.shipping_address}<br>",
        f"      <strong>Permanent Address:</strong> {order.permanent_address}<br>",
        "    </p>",
        "    <h3 style='border-bottom: 2px solid #eee; padding-bottom: 5px;'>Order Summary</h3>",
        "    <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>",
        "      <thead>",
        "        <tr style='background-color: #f8f9fa; border-bottom: 1px solid #ddd;'>",
        "          <th style='padding: 8px; text-align: left;'>Product</th>",
        "          <th style='padding: 8px; text-align: center;'>Quantity</th>",
        "          <th style='padding: 8px; text-align: right;'>Price</th>",
        "          <th style='padding: 8px; text-align: right;'>Total</th>",
        "        </tr>",
        "      </thead>",
        "      <tbody>"
    ]

    for item in products_details:
        html_lines.append(
            f"        <tr style='border-bottom: 1px solid #eee;'>"
            f"          <td style='padding: 8px;'>{item['name']}</td>"
            f"          <td style='padding: 8px; text-align: center;'>{item['quantity']}</td>"
            f"          <td style='padding: 8px; text-align: right;'>Rs. {item['price']:.2f}</td>"
            f"          <td style='padding: 8px; text-align: right;'>Rs. {item['line_total']:.2f}</td>"
            f"        </tr>"
        )

    html_lines.extend([
        "      </tbody>",
        "    </table>",
        "    <div style='margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;'>",
        f"      <p style='margin: 0; font-size: 14px;'>Total Savings: <strong>Rs. {order.total_savings:.2f}</strong></p>",
        f"      <p style='margin: 5px 0 0 0; font-size: 18px; color: #10B981;'>Grand Total: <strong>Rs. {order.grand_total:.2f}</strong></p>",
        "    </div>",
        "    <p style='margin-top: 30px; font-size: 12px; color: #777;'>This is an automated message from your DeepDive store backend.</p>",
        "  </body>",
        "</html>"
    ])
    
    html_content = "\\n".join(html_lines)

    msg.set_content("Your email client does not support HTML. Please view this email in a modern client.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print(f"Successfully sent admin email notification for Order #{order.id}")
    except Exception as e:
        print(f"Failed to send email notification: {str(e)}")
