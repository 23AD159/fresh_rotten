from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from predict import predict
import os
import price_service

app = Flask(__name__)
CORS(app)

# Register price service routes with the main app
price_service.register_price_service_routes(app)
# Kick off the daily scheduler so weather/price datasets refresh every 24h
price_service.start_scheduler_thread()

# ------------------- MongoDB Connection -------------------
app.config["MONGO_URI"] = "mongodb://localhost:27017/farmfresh"
mongo = PyMongo(app)
users_collection = mongo.db.users   # Our collection

# ------------------- File Upload Setup -------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ------------------- PREDICT API -------------------
@app.route("/predict", methods=["POST"])
def predict_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        label, confidence = predict(file_path)
        return jsonify({"prediction": label, "confidence": confidence})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict_uploaded", methods=["GET"])
def predict_uploaded():
    """
    Predict freshness for an image that already exists in the uploads folder.
    Expects a query parameter ?file=FILENAME.jpg matching a file in UPLOAD_FOLDER.
    """
    file_name = request.args.get("file")
    if not file_name:
        return jsonify({"error": "file query parameter is required"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    if not os.path.isfile(file_path):
        return jsonify({"error": f"File not found: {file_name}"}), 404

    try:
        label, confidence = predict(file_path)
        return jsonify({"prediction": label, "confidence": confidence})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------- REGISTER API -------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # Check if user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # Hash password before saving
    hashed_password = generate_password_hash(password)

    user = {
        "firstName": data.get("firstName"),
        "lastName": data.get("lastName"),
        "email": email,
        "password": hashed_password,
        "userType": data.get("userType", "customer"),
        "phone": data.get("phone"),
        "address": data.get("address"),
        "farmName": data.get("farmName"),
        "farmSize": data.get("farmSize"),
        "soilType": data.get("soilType")
    }

    users_collection.insert_one(user)
    return jsonify({"message": "User registered successfully"}), 201

# ------------------- LOGIN API -------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "email": user["email"],
            "userType": user["userType"],
            "firstName": user.get("firstName"),
            "lastName": user.get("lastName")
        }
    }), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)
