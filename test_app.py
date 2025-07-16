import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

class TestApp(unittest.TestCase):
    def setUp(self):
        # Mock the model and preprocessor loading
        with patch('joblib.load') as mock_load:
            mock_model = MagicMock()
            mock_preprocessor = MagicMock()
            mock_load.side_effect = [mock_model, mock_preprocessor]
            
            import app
            self.app = app.app.test_client()
            self.app.testing = True
    
    def test_home_route(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Smart Traffic Delay Predictor API is running!', response.data)
    
    def test_predict_delay_no_data(self):
        response = self.app.post('/predict-delay', json={})
        self.assertEqual(response.status_code, 400)
    
    def test_predict_delay_missing_fields(self):
        incomplete_data = {
            'distance_km': 100,
            'duration_min': 120
            # Missing required fields
        }
        response = self.app.post('/predict-delay', json=incomplete_data)
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
