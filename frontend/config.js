// Configuration file for API keys and settings
// In production, these should be environment variables
const config = {
  // API Keys - Replace with your actual keys
  ORS_API_KEY: "5b3ce3597851110001cf624899df53ebe75f484f914504a81753fb06",
  WEATHER_API_KEY: "12a758df386fc5d9df7a9431e35f7b93",
  
  // Backend URL - Change for production deployment
  BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://127.0.0.1:5000" 
    : "https://smart-travel-delay-prediction.onrender.com", // Update this for production
  
  // Map settings
  MAP_CENTER: [20, 0],
  MAP_ZOOM: 2,
  
  // Route sampling
  SAMPLE_INTERVAL: 10
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
