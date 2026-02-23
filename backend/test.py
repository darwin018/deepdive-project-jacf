print("Hello from test.py")
import os
print("CWD:", os.getcwd())
try:
    import app
    print("Imported app")
except ImportError as e:
    print("Failed to import app:", e)
