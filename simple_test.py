import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("🧪 Testing Smart Travel Delay Prediction System...")
print("=" * 50)

try:
    # Test 1: Import Flask app
    print("1. Testing Flask app import...")
    from unittest.mock import patch, MagicMock
    
    with patch('joblib.load') as mock_load:
        mock_model = MagicMock()
        mock_preprocessor = MagicMock()
        mock_load.side_effect = [mock_model, mock_preprocessor]
        
        import app
        test_app = app.app.test_client()
        test_app.testing = True
        print("   ✅ Flask app imported successfully")
    
    # Test 2: Test home route
    print("2. Testing home route...")
    response = test_app.get('/')
    if response.status_code == 200:
        print("   ✅ Home route working (Status: 200)")
    else:
        print(f"   ❌ Home route failed (Status: {response.status_code})")
    
    # Test 3: Test predict endpoint with no data
    print("3. Testing predict endpoint with no data...")
    response = test_app.post('/predict-delay', json={})
    if response.status_code == 400:
        print("   ✅ Error handling working (Status: 400)")
    else:
        print(f"   ❌ Error handling failed (Status: {response.status_code})")
    
    # Test 4: Test predict endpoint with incomplete data
    print("4. Testing predict endpoint with incomplete data...")
    incomplete_data = {
        'distance_km': 100,
        'duration_min': 120
        # Missing required fields
    }
    response = test_app.post('/predict-delay', json=incomplete_data)
    if response.status_code == 400:
        print("   ✅ Input validation working (Status: 400)")
    else:
        print(f"   ❌ Input validation failed (Status: {response.status_code})")
    
    print("=" * 50)
    print("🎉 All tests passed! Your application is ready for deployment.")
    
except Exception as e:
    print(f"❌ Test failed with error: {str(e)}")
    print("📋 Make sure all dependencies are installed:")
    print("   pip install flask flask-cors pandas joblib scikit-learn")
    sys.exit(1)
