from flask import Flask, render_template, request, jsonify
from PIL import Image
import pytesseract
import os
import cv2
import sys
import base64
from io import BytesIO
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()  # Load environment variables from .env file

# Set the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD_PATH")

def perform_ocr(image_path):
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    return text

def process_base64_image(image_data):
    # Convert base64 image data to image file
    image_data = image_data.split(',')[1]  # Remove the "data:image/png;base64," prefix
    img_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(img_bytes))

    # Save the image to a file (you may need to adjust the path)
    image_path = "captured_image.png"
    img.save(image_path)

    return image_path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    data = request.get_json()

    # Check if the request contains 'image_data' (uploaded image) or 'camera_data' (camera-captured image)
    if 'image_data' in data:
        image_data = data.get('image_data')
        image_path = process_base64_image(image_data)
    elif 'camera_data' in data:
        image_data = data.get('camera_data')
        image_path = process_base64_image(image_data)
    else:
        return jsonify({'error': 'Invalid request'})

    # Perform OCR on the captured image
    result = perform_ocr(image_path)

    return jsonify({'result': result})

if __name__ == "__main__":
    app.run(debug=True)
