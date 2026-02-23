import sys
import traceback

with open("out_payment.log", "w") as f:
    try:
        from app.database import engine
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE orders ADD COLUMN payment_status VARCHAR DEFAULT 'Pending'"))
        f.write("Success! Payment Column added.\n")
    except Exception as e:
        f.write("Error: " + str(e) + "\n")
        f.write(traceback.format_exc())
