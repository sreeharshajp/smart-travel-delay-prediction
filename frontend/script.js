// Initialize Leaflet map globally
// Here L is the Global variable defined in the Leaflet library
// using L we will access the Leaflet functions like map, tileLayer, geoJSON etc.
const map = L.map('map').setView(config.MAP_CENTER, config.MAP_ZOOM); // Initial world view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let routeLayer; // holds the current route polyline layer on the map

// Main function to run when Predict Delay button clicked
async function predictDelay() {
  const origin = document.getElementById('origin').value.trim().toLowerCase();
  const destination = document.getElementById('destination').value.trim().toLowerCase();

  if (!origin || !destination) {
    alert("Please enter both origin and destination.");
    return;
  }

  try {
    const ORS_API_KEY = config.ORS_API_KEY;
    const WEATHER_API_KEY = config.WEATHER_API_KEY;

    const geocode = async (city) => {
      const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(city)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Geocode API error for ${city}: ${response.statusText}`);
      const data = await response.json();
      if (!data.features.length) throw new Error(`No geocode results for ${city}`);
      // After Error check, we can safely access the first feature
      // example ORS response check here:
      /* https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf624899df53ebe75f484f914504a81753fb06&text=New%20Delhi */

      const coords = data.features[0].geometry.coordinates; 
      // In Features inside the geometry in the coordinates we have the longitude and latitude
      /*  "features": [
        {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.163665, 28.557163]
      }, */  // So According to that we accessed the coordinates 
      return { lat: coords[1], lng: coords[0] };
    };

     // smae gecode function is used to get the coordinates of both origin and destination
     // We are using Promise.all to run both geocode requests in parallel
     // can be used to run multiple asynchronous tasks in parallel

    const [originCoords, destinationCoords] = await Promise.all([
      geocode(origin),
      geocode(destination),
    ]);
    
     // Sends a POST request to OpenRouteService asking for a car route between origin and destination.
     // In Jsonresponse we get the route data which contains the coordinates of the route

     /*  These are the main contents of the response:
      bbox:       Bounding box of the route (for map auto-zoom).
      routes:     List of routes (usually only one).
      summary:    Contains total distance (m) and duration (s).
      segments:   Contains step-by-step navigation info.
      geometry:   Encoded polyline of the full route path (for map).
      way_points: Indexes of key route points.
      metadata:   Request info like coordinates, profile, timestamp, etc.
      */

    const routeUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
    const routeResponse = await fetch(routeUrl, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [
          [originCoords.lng, originCoords.lat],
          [destinationCoords.lng, destinationCoords.lat]
        ],
        instructions: true,
        elevation: false,
      }) // here in this link in directions after settting the body and headers we can see json data 
    });// link to check: https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/post 



    if (!routeResponse.ok) throw new Error("Route API error");
    const routeData = await routeResponse.json(); 

    if (routeLayer) {
      map.removeLayer(routeLayer); //Built in Leaf Function to remove the previous route layer
    }

    //after removing we are adding the new route layer to the map from the routeData our defined variable.
    // ving-car/geojson' because of that part in link we are not reqired
    // to assign the feature exactly like routeData.features[0].geometry.coordinates
    // directly assigned, As it is geoformated and coming to us.
    routeLayer = L.geoJSON(routeData, {  // this line only I am telling
      style: { color: 'blue', weight: 3.5 }
    }).addTo(map);

    //Extracts coordinate list and zooms the map to fit the route bounds.
    const coords = routeData.features[0].geometry.coordinates; // array of coord are assigned to it between the source & dest.
    /*[
    [77.2167, 28.6667],
    [77.2200, 28.6700],  // like this we get the coordinates of the route
    [77.2250, 28.6750],
    ...
    ] */
    const latLngs = coords.map(c => [c[1], c[0]]); //Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
    map.fitBounds(latLngs);

    //Fetches weather data by city name.
    const fetchWeather = async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(`Weather API error for ${city}: ${data.message}`);
      return data;
    };

    //Fetches origin and destination weather in parallel.
    // originWeather will hold weather data for origin
    // destinationWeather will hold weather data for destination
    const [originWeather, destinationWeather] = await Promise.all([
      fetchWeather(origin),
      fetchWeather(destination),
    ]);

    // picks ~10 evenly spaced points along the route.
    const sampleInterval = config.SAMPLE_INTERVAL;
    const totalPoints = coords.length; // total number of coordinates in the route. a[{},{}...]
    const step = Math.max(1, Math.floor(totalPoints / sampleInterval));

    const sampledCoords = [];
    for (let i = 0; i < totalPoints; i=i+step) {
      const [lng, lat] = coords[i];
      sampledCoords.push({ lat, lon: lng }); // PUSHING THE ONES INTO NEWLY CREATED ARRAY
    }

    //Fetches weather by coordinates and extracts useful details.
    const fetchWeatherByCoords = async ({ lat, lon }) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(`Weather API error at [${lat},${lon}]: ${data.message}`);
      return {
        lat,
        lon,
        condition: data.weather?.[0]?.description || "Unknown",
        temperature: data.main?.temp ?? "N/A",
        wind: data.wind?.speed ?? "N/A"
      };
    };

    //Fetches weather for all sampled points along the route.
    // stored in routeWeatherConditions
    const routeWeatherConditions = await Promise.all(
      //To get the weather for all points, you must call the function once per coordinate So you use .map():
      sampledCoords.map(coord => fetchWeatherByCoords(coord))
    );
    // The conditions that we will display in the result
    const sourceText = originWeather?.weather?.[0]
    // ? if data avaiable prints that if not prints the else part 2 line
      ? `Source (${origin}): ${originWeather.weather[0].description}, ${originWeather.main.temp}°C, Wind ${originWeather.wind.speed} m/s`
      : `Source (${origin}): Weather data not available`;

    const destinationText = destinationWeather?.weather?.[0]
      ? `Destination (${destination}): ${destinationWeather.weather[0].description}, ${destinationWeather.main.temp}°C, Wind ${destinationWeather.wind.speed} m/s`
      : `Destination (${destination}): Weather data not available`;

    //The conditions stored in the routeWeatherConditions will be accesed and displayed in the result
    // The route points will be displayed in the result
    const pointsText = routeWeatherConditions.map((w, i) =>
      `Point ${i + 1}: ${w.condition}, ${w.temperature}°C, Wind ${w.wind} m/s`
    ).join('\n');

    
           // ---------- ML Integration ----------
    // in the summary we have the distance and duration of the route
    const summary = routeData.features[0].properties.summary;
    const distance_km = summary.distance / 1000; // metres to km 
    const duration_min = summary.duration / 60; // seconds to minutes
    const origin_temp = originWeather.main.temp;
    const origin_wind = originWeather.wind.speed;
    const dest_temp = destinationWeather.main.temp;
    const dest_wind = destinationWeather.wind.speed;

    const avg_temp_along_route = routeWeatherConditions.reduce((sum, w) => sum + w.temperature, 0) / routeWeatherConditions.length;
    const avg_wind_along_route = routeWeatherConditions.reduce((sum, w) => sum + w.wind, 0) / routeWeatherConditions.length;

    // ---------- Weather Severity Mapping ----------
    // This map defines the severity of different weather conditions
    const weatherSeverityMap = {
      "clear sky": 0, "few clouds": 0.3, "scattered clouds": 0.5, "broken clouds": 0.7, "overcast clouds": 0.7,
    "light rain": 2, "moderate rain": 2.5, "heavy intensity rain": 3, "very heavy rain": 3.5, "extreme rain": 4,
    "shower rain": 2.8, "ragged shower rain": 3.2, "light intensity shower rain": 2.7, "heavy intensity shower rain": 3.3,
    "light snow": 2.5, "snow": 3, "heavy snow": 3.5, "sleet": 3.2,
    "light intensity drizzle": 1.8, "drizzle": 2, "heavy intensity drizzle": 2.5,
    "shower rain and drizzle": 3, "heavy shower rain and drizzle": 3.5,
    "mist": 1, "smoke": 1.2, "haze": 1.5, "fog": 2, "sand": 2, "dust": 2.2, "sand/dust whirls": 2.5,
    "volcanic ash": 3, "squalls": 3.5, "tornado": 5,
    "thunderstorm with light rain": 3, "thunderstorm with rain": 3.5, "thunderstorm with heavy rain": 4,
    "light thunderstorm": 3, "thunderstorm": 3.5, "heavy thunderstorm": 4,
    "ragged thunderstorm": 4, "thunderstorm with drizzle": 3.5, "thunderstorm with heavy drizzle": 4
  };

    //this checks for the codition in the weatherSeverityMap and returns the severity score
    // Iterates if match found then returns that severity score if not found then returns 1 as default
    const getSeverity = (desc) => {
      const key = Object.keys(weatherSeverityMap).find(k => desc.includes(k));
      return key ? weatherSeverityMap[key] : 1;
    };

    const conditionScores = routeWeatherConditions.map(w => getSeverity(w.condition.toLowerCase()));
    const mean_condition = conditionScores.reduce((a, b) => a + b, 0) / conditionScores.length;
    const max_condition = Math.max(...conditionScores);
    const severe_count = conditionScores.filter(s => s >= 3).length;

    //Collects all input features required by your machine learning model ApI
    const mlPayload = {
      distance_km,
      duration_min,
      origin_temp,
      origin_wind,
      dest_temp,
      dest_wind,
      avg_temp_along_route,
      avg_wind_along_route,
      mean_condition,
      max_condition,
      severe_count
    };

    let predictedDelay = "N/A";
    try {
      //Sends the payload to your local Flask API (running on port 5000).
      const mlResponse = await fetch(`${config.BACKEND_URL}/predict-delay`, { // we also given the endpoint(/predict-delay) in the Flask app
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload)
      });

      if (!mlResponse.ok) throw new Error(`ML API returned status ${mlResponse.status}`);

      const mlResult = await mlResponse.json();
      //The nullish coalescing operator (??) returns the right-hand operand when the left-hand operand is null or undefined.
      predictedDelay =  mlResult?.delay_minutes ?? "N/A";
    } catch (err) {
      console.error("ML prediction failed:", err);
    }

    // ---------- code to format time ----------
    function formatTime(minutes) {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      // if both hours and minutes are greater than 0, return both
      if (hrs > 0 && mins > 0) return `${hrs} hour${hrs > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
      if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''}`;
      return `${mins} minute${mins > 1 ? 's' : ''}`;
    }

    // Formats the predicted delay into a human-readable string
    // If the predicted delay is a number, it formats it; otherwise, it shows "N/A"
    // This will be used to display the delay in the result section
    const displayDelay = !isNaN(predictedDelay) ? formatTime(predictedDelay) : "N/A";

    // ---------- Display Results ----------
    // Makes the first letter of origin and destination capitalized
    // .slice(1) returns the string from the second character to the end
    document.getElementById('result').innerHTML = `
      <h3>🛣️ Route Information</h3>
      <p><strong>From:</strong> ${origin.charAt(0).toUpperCase() + origin.slice(1)} → ${destination.charAt(0).toUpperCase() + destination.slice(1)}</p>
      <p><strong>Distance:</strong> ${distance_km.toFixed(2)} km</p>
      
      <h3>⏱️ Predicted Delay</h3>
      <p><strong>${displayDelay}</strong></p>

      <h3>🌤️ Route Weather Conditions</h3>
      <pre>
${sourceText}

${pointsText}

${destinationText}
      </pre>
    `;

  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error(error);
  }
}
