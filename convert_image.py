
import sys
try:
    from PIL import Image
    img = Image.open("public/laliga_symbol.png")
    img.save("public/laliga_symbol_converted.png", "PNG")
    print("Conversion successful")
except ImportError:
    print("PIL not found")
except Exception as e:
    print(f"Error: {e}")
