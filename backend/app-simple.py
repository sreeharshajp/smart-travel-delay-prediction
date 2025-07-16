from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can access it

@app.route('/')
def home():
    return "Smart Traffic Delay Predictor API is running!"

@app.route('/predict-delay', methods=['POST'])
def predict_delay():
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

        # Simple prediction logic (placeholder for ML model)
        # In a real scenario, you'd load and use your trained model
        base_delay = input_data.get('duration_min', 0) * 0.1  # 10% of duration
        weather_factor = input_data.get('mean_condition', 1) * 2
        distance_factor = input_data.get('distance_km', 0) * 0.05
        
        predicted_delay = base_delay + weather_factor + distance_factor + random.uniform(-5, 15)
        predicted_delay = max(0, predicted_delay)  # Ensure non-negative

        return jsonify({
            "delay_minutes": round(float(predicted_delay), 2),
            "status": "success",
            "note": "Using simplified prediction model"
        })
    
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
