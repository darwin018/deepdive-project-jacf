import sys
import traceback

with open("out_images.log", "w") as f:
    try:
        from app.database import engine
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN image_data BYTEA"))
            conn.execute(text("ALTER TABLE products ADD COLUMN image_mime_type VARCHAR"))
            conn.execute(text("ALTER TABLE categories ADD COLUMN image_data BYTEA"))
            conn.execute(text("ALTER TABLE categories ADD COLUMN image_mime_type VARCHAR"))
        f.write("Success! image_data and image_mime_type columns added to products and categories.\n")
        print("Success! image_data and image_mime_type columns added to products and categories.")
    except Exception as e:
        f.write("Error: " + str(e) + "\n")
        f.write(traceback.format_exc())
        print(f"Error: {e}")
