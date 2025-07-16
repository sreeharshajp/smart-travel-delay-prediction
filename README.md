# Smart Travel Delay Prediction System

A web application that predicts travel delays based on weather conditions and route information using machine learning.

## Features

- 🌍 Interactive map visualization using Leaflet
- 🛣️ Route planning with OpenRouteService API
- 🌤️ Real-time weather data integration
- 🤖 Machine learning-based delay prediction
- 📱 Responsive web interface

## Project Structure

```
Smart Travel Delay By Weather/
├── backend/
│   ├── app.py              # Flask API server
│   ├── model.pkl           # Trained ML model
│   ├── preprocess.pkl      # Data preprocessor
│   └── dataset files...
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── script.js           # JavaScript logic
│   ├── style.css           # Styling
│   └── assets/
└── requirements.txt        # Python dependencies
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Git
- A web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-travel-delay-prediction.git
   cd smart-travel-delay-prediction
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API Keys**
   - Get your OpenRouteService API key from [OpenRouteService](https://openrouteservice.org/)
   - Get your OpenWeatherMap API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Replace the API keys in `frontend/script.js` or use environment variables

5. **Run the application**
   ```bash
   # Start the Flask backend
   cd backend
   python app.py
   
   # In another terminal, serve the frontend
   # You can use Python's built-in server:
   cd frontend
   python -m http.server 8000
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:8000`

## Deployment

### Local Development
- Backend runs on `http://localhost:5000`
- Frontend can be served on any static file server

### Production Deployment Options

#### Option 1: Heroku
1. Create a `Procfile` in the root directory
2. Deploy using Heroku CLI
3. Configure environment variables

#### Option 2: Railway/Render
1. Connect your GitHub repository
2. Configure build and start commands
3. Set environment variables

#### Option 3: Traditional VPS
1. Set up a reverse proxy (nginx)
2. Use gunicorn for Flask app
3. Serve static files with nginx

## API Endpoints

- `GET /` - Health check
- `POST /predict-delay` - Predict travel delay

### Request Format for /predict-delay
```json
{
  "distance_km": 120.5,
  "duration_min": 150,
  "origin_temp": 25.0,
  "origin_wind": 3.2,
  "dest_temp": 28.0,
  "dest_wind": 2.8,
  "avg_temp_along_route": 26.5,
  "avg_wind_along_route": 3.0,
  "mean_condition": 1.5,
  "max_condition": 2.0,
  "severe_count": 1
}
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, Leaflet Maps
- **Backend**: Flask, Python
- **Machine Learning**: scikit-learn, pandas, numpy
- **APIs**: OpenRouteService, OpenWeatherMap
- **Deployment**: Gunicorn, CORS support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Notes

- Ensure your API keys are kept secure
- The ML model requires specific input features as listed in the API documentation
- For production use, consider implementing rate limiting and authentication
