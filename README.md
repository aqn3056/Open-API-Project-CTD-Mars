Open API Weather Project:
    A weather dashboard built with plain HTML, CSS, and JavaScript, powered by the [Open-Meteo API](https://open-meteo.com/).

How to run:
    - Clone or download this repository
    
    Repo clone:
    - Open the project folder after cloning. Then start a Live Preview Server in command palette

    Download:
    - Open `index.html` in any modern web browser
    - No build tools, dependencies, or API keys required

Project Structure:
    - `index.html` - Main HTML document with the page layout and structure
    - `styles.css` - All styling
    - `app.js` - Application logic, API calls, and DOM rendering
    - `README.md` - Overview and instructions

Features:
    - Search for any city with autocomplete suggestions
    - Two navigation views: **Temperature** and **Conditions**
    - Current weather, hourly forecast (24h), and 7-day forecast
    - Responsive design for mobile and desktop
    - Loading states and error handling

API Endpoints:
    This app uses two separate GET requests to the Open-Meteo Forecast API:

Endpoint 1: Temperature Data
    Fetches current temperature, apparent temperature, hourly temperatures, and daily high/low values.

Endpoint 2: Conditions Data
    Fetches weather code, wind speed, humidity, precipitation, UV index, and related hourly/daily forecasts.
    
    Each navigation tab triggers a fresh API request for only the data needed by that view.

Geocoding:
    City search uses the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) with debounced input for autocomplete suggestions.
