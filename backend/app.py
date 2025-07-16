from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
from werkzeug.exceptions import BadRequest

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can access it

# Load your ML model and preprocessor
try:
    model = joblib.load('model.pkl')
    preprocessor = joblib.load('preprocess.pkl')
    print("Model and preprocessor loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    preprocessor = None

@app.route('/')
def home():
    return "Smart Traffic Delay Predictor API is running!"

@app.route('/predict-delay', methods=['POST'])
def predict_delay():
    if model is None or preprocessor is None:
        return jsonify({"error": "Model not loaded. Please check server logs."}), 500
        
    try:
        # Parse JSON input
        input_data = request.get_json()
        
        if not input_data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Validate required fields
        required_fields = [
            'distance_km', 'duration_min', 'origin_temp', 'origin_wind',
            'dest_temp', 'dest_wind', 'avg_temp_along_route', 'avg_wind_along_route',
            'mean_condition', 'max_condition', 'severe_count'
        ]
        
        missing_fields = [field for field in required_fields if field not in input_data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

        # Convert to DataFrame
        df = pd.DataFrame([input_data])

        # Preprocess the input
        X_processed = preprocessor.transform(df)

        # Predict using model
        predicted_delay = model.predict(X_processed)[0]

        return jsonify({
            "delay_minutes": round(float(predicted_delay), 2),
            "status": "success"
        })
    
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
