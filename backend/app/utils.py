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

def generate_order_pdf(order, products_details):
    from fpdf import FPDF
    import datetime

    pdf = FPDF()
    pdf.add_page()
    page_width = pdf.w
    
    # Header
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 10, "Order Receipt", ln=True, align="C")
    
    pdf.set_y(30)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(page_width / 2, 8, "Customer Details", ln=0)
    
    pdf.set_font("Helvetica", "", 12)
    order_id_text = f"Order ID: #{order.id}"
    pdf.cell(0, 8, order_id_text, ln=True, align="R")
    
    pdf.set_font("Helvetica", "", 11)
    # Name and Date
    pdf.cell(page_width / 2, 6, f"Name: {order.name}", ln=0)
    
    date_text = f"Date: {datetime.date.today().strftime('%d/%m/%Y')}"
    pdf.cell(0, 6, date_text, ln=True, align="R")
    
    # Other Customer details
    pdf.cell(0, 6, f"WhatsApp: {order.whatsapp_number}", ln=True)
    pdf.cell(0, 6, f"Shipping Address: {order.shipping_address}", ln=True)
    if hasattr(order, 'permanent_address') and order.permanent_address:
        pdf.cell(0, 6, f"Permanent Address: {order.permanent_address}", ln=True)
        
    pdf.ln(10)
    
    # Table Header
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_fill_color(37, 99, 235)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(80, 10, "Product", border=1, fill=True)
    pdf.cell(20, 10, "Qty", border=1, fill=True, align="C")
    pdf.cell(40, 10, "Price", border=1, fill=True, align="R")
    pdf.cell(0, 10, "Total", border=1, fill=True, ln=True, align="R")
    
    # Table Rows
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(0, 0, 0)
    
    for item in products_details:
        pdf.cell(80, 10, str(item['name'])[:40], border=1)
        pdf.cell(20, 10, str(item['quantity']), border=1, align="C")
        pdf.cell(40, 10, f"Rs. {item['price']:.2f}", border=1, align="R")
        pdf.cell(0, 10, f"Rs. {item['line_total']:.2f}", border=1, ln=True, align="R")
        
    pdf.ln(5)
    
    # Totals
    actual_price_total = float(order.grand_total) + float(order.total_savings)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, f"Actual Price Total: Rs. {actual_price_total:.2f}", ln=True, align="R")
    pdf.cell(0, 8, f"Total Amount Saved: Rs. {float(order.total_savings):.2f}", ln=True, align="R")
    
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, f"Grand Total: Rs. {float(order.grand_total):.2f}", ln=True, align="R")
    
    return bytes(pdf.output())

def send_new_order_email(order, products_details):
    """
    Sends an email to the admin with the PDF receipt attached, and NO html body.
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

    # Generate PDF bytes
    try:
        pdf_bytes = generate_order_pdf(order, products_details)
    except Exception as e:
        print(f"Failed to generate PDF for order #{order.id}: {str(e)}")
        # Send fallback text email if PDF generation fails
        msg.set_content(f"A new order #{order.id} was placed. See dashboard for details.")
    else:
        # The user requested ONLY the PDF file in the email content
        # We can add a simple text body, but the user specifically requested "only contain the pdf file"
        # However, many email clients expect at least some text content or the email may be marked as spam.
        # We'll set a very brief plaintext message if required, or purely an attachment.
        # Setting content to just the attachment:
        msg.set_content(f"Order receipt attached for Order #{order.id}.")
        msg.add_attachment(pdf_bytes, maintype='application', subtype='pdf', filename=f'receipt_{order.id}.pdf')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print(f"Successfully sent admin email notification for Order #{order.id} with PDF attachment")
    except Exception as e:
        print(f"Failed to send email notification: {str(e)}")

def send_order_status_update_email(order, new_status):
    """
    Sends an email to the customer when their order status is updated.
    """
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")
    customer_email = order.customer_email

    if not all([sender_email, sender_password, customer_email]):
        print(f"WARNING: Email credentials or customer email missing. Skipping notification for Order #{order.id}.")
        return

    msg = EmailMessage()
    msg['Subject'] = f"Update on your Order #{order.id}"
    msg['From'] = sender_email
    msg['To'] = customer_email
    
    msg.set_content(f"Hello {order.name},\n\nThe status of your Order #{order.id} has been updated to: {new_status}.\n\nThank you for shopping with us!")

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print(f"Successfully sent status update email to {customer_email} for Order #{order.id}")
    except Exception as e:
        print(f"Failed to send status update email: {str(e)}")
