// State
const state = {
  currentView: "temperature",
  location: null,
  useFahrenheit: true,
};

// DOM References
const $ = (sel) => document.querySelector(sel);
const navTemp = $("#nav-temp");
const navCond = $("#nav-cond");
const cityInput = $("#city-input");
const searchBtn = $("#search-btn");
const suggestionsEl = $("#suggestions");
const loadingEl = $("#loading");
const errorEl = $("#error");
const contentEl = $("#content");
const viewTemp = $("#view-temperature");
const viewCond = $("#view-conditions");
const unitToggle = $("#unit-toggle");

// Weather Code Mapping
const weatherCodes = {
  0: { desc: "Clear sky", icon: "\u2600\uFE0F" },
  1: { desc: "Mainly clear", icon: "\uD83C\uDF24\uFE0F" },
  2: { desc: "Partly cloudy", icon: "\u26C5" },
  3: { desc: "Overcast", icon: "\u2601\uFE0F" },
  45: { desc: "Fog", icon: "\uD83C\uDF2B\uFE0F" },
  48: { desc: "Depositing rime fog", icon: "\uD83C\uDF2B\uFE0F" },
  51: { desc: "Light drizzle", icon: "\uD83C\uDF26\uFE0F" },
  53: { desc: "Moderate drizzle", icon: "\uD83C\uDF26\uFE0F" },
  55: { desc: "Dense drizzle", icon: "\uD83C\uDF27\uFE0F" },
  56: { desc: "Light freezing drizzle", icon: "\uD83C\uDF28\uFE0F" },
  57: { desc: "Dense freezing drizzle", icon: "\uD83C\uDF28\uFE0F" },
  61: { desc: "Slight rain", icon: "\uD83C\uDF26\uFE0F" },
  63: { desc: "Moderate rain", icon: "\uD83C\uDF27\uFE0F" },
  65: { desc: "Heavy rain", icon: "\uD83C\uDF27\uFE0F" },
  66: { desc: "Light freezing rain", icon: "\uD83C\uDF28\uFE0F" },
  67: { desc: "Heavy freezing rain", icon: "\uD83C\uDF28\uFE0F" },
  71: { desc: "Slight snow", icon: "\uD83C\uDF28\uFE0F" },
  73: { desc: "Moderate snow", icon: "\u2744\uFE0F" },
  75: { desc: "Heavy snow", icon: "\u2744\uFE0F" },
  77: { desc: "Snow grains", icon: "\u2744\uFE0F" },
  80: { desc: "Slight rain showers", icon: "\uD83C\uDF26\uFE0F" },
  81: { desc: "Moderate rain showers", icon: "\uD83C\uDF27\uFE0F" },
  82: { desc: "Violent rain showers", icon: "\uD83C\uDF27\uFE0F" },
  85: { desc: "Slight snow showers", icon: "\uD83C\uDF28\uFE0F" },
  86: { desc: "Heavy snow showers", icon: "\u2744\uFE0F" },
  95: { desc: "Thunderstorm", icon: "\u26A1" },
  96: { desc: "Thunderstorm with slight hail", icon: "\u26A1" },
  99: { desc: "Thunderstorm with heavy hail", icon: "\u26A1" },
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { desc: "Unknown", icon: "\u2753" };
}

// Utility
function tempUnit() {
  return state.useFahrenheit ? "\u00B0F" : "\u00B0C";
}

function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  contentEl.classList.add("hidden");
}

function showError(msg) {
  loadingEl.classList.add("hidden");
  errorEl.classList.remove("hidden");
  errorEl.textContent = msg;
  contentEl.classList.add("hidden");
}

function showContent() {
  loadingEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  contentEl.classList.remove("hidden");
}

function formatHour(isoString) {
  const d = new Date(isoString);
  const h = d.getHours();
  return h + ":00";
}

function formatDay(isoString) {
  const d = new Date(isoString + "T00:00:00");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()];
}

function windDirection(degrees) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
}

// SVG Icons for stat cards
const svgIcons = {
  humidity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>',
  precipitation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
  feelsLike: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
  high: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>',
  low: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  uv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>',
};

function makeStatCard(iconKey, label, value) {
  return '<div class="stat-card stat-' + iconKey + '">' + svgIcons[iconKey] +
    '<span class="stat-label">' + label + '</span>' +
    '<span class="stat-value">' + value + '</span></div>';
}

//  Geocoding
let searchTimeout = null;

async function searchCities(query) {
  if (!query || query.length < 2) {
    suggestionsEl.classList.add("hidden");
    return;
  }
  try {
    const res = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(query) + "&count=5&language=en&format=json"
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      suggestionsEl.classList.add("hidden");
      return;
    }
    suggestionsEl.innerHTML = "";
    data.results.forEach((r) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.tabIndex = 0;
      const region = [];
      if (r.admin1) region.push(r.admin1);
      if (r.country) region.push(r.country);
      div.innerHTML =
        '<svg class="suggestion-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">' +
          '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
          '<circle cx="12" cy="10" r="3"/>' +
        '</svg>' +
        '<div class="suggestion-text">' +
          '<span class="suggestion-name">' + r.name + '</span>' +
          '<span class="suggestion-region">' + region.join(", ") + '</span>' +
        '</div>';
      div.addEventListener("click", () => selectCity(r));
      div.addEventListener("keydown", (e) => {
        if (e.key === "Enter") selectCity(r);
      });
      suggestionsEl.appendChild(div);
    });
    suggestionsEl.classList.remove("hidden");
  } catch {
    suggestionsEl.classList.add("hidden");
  }
}

function selectCity(result) {
  state.location = {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country || "",
    admin1: result.admin1 || "",
  };
  cityInput.value = result.name;
  suggestionsEl.classList.add("hidden");
  fetchCurrentView();
}

// API Calls
function getTempUnitParam() {
  return state.useFahrenheit ? "fahrenheit" : "celsius";
}

// Endpoint 1: Temperature data only
async function fetchTemperatureData(lat, lon) {
  var url =
    "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,uv_index" +
    "&hourly=temperature_2m,weather_code" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
    "&temperature_unit=" + getTempUnitParam() +
    "&wind_speed_unit=mph&timezone=auto&forecast_days=7";
  var res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch temperature data");
  return res.json();
}

// Endpoint 2: Conditions data only
async function fetchConditionsData(lat, lon) {
  var url =
    "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
    "&current=weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation,uv_index" +
    "&hourly=weather_code,wind_speed_10m,relative_humidity_2m,precipitation_probability" +
    "&daily=weather_code,precipitation_sum,wind_speed_10m_max,precipitation_probability_max" +
    "&temperature_unit=" + getTempUnitParam() +
    "&wind_speed_unit=mph&timezone=auto&forecast_days=7";
  var res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch conditions data");
  return res.json();
}

// Render Functions
function renderLocationHeader() {
  var loc = state.location;
  var parts = [loc.name];
  if (loc.admin1) parts.push(loc.admin1);
  if (loc.country) parts.push(loc.country);
  $("#location-name").textContent = parts.join(", ");
  $("#location-coords").textContent =
    loc.latitude.toFixed(2) + "\u00B0N, " + Math.abs(loc.longitude).toFixed(2) + "\u00B0" + (loc.longitude < 0 ? "W" : "E");
}

function renderTemperatureView(data) {
  var current = data.current;
  var hourly = data.hourly;
  var daily = data.daily;
  // Current
  var weatherInfo = getWeatherInfo(current.weather_code);
  $("#current-temp").textContent = Math.round(current.temperature_2m);
  $("#current-weather-icon").textContent = weatherInfo.icon;
  $("#current-weather-desc").textContent = weatherInfo.desc;
  $("#current-feels-like").textContent =
    "Feels like " + Math.round(current.apparent_temperature) + "\u00B0";

  // Stat cards
  $("#temp-stat-cards").innerHTML =
    makeStatCard("humidity", "Humidity", current.relative_humidity_2m + "%") +
    makeStatCard("wind", "Wind", Math.round(current.wind_speed_10m) + " km/h") +
    makeStatCard("precipitation", "Precipitation", current.precipitation + " mm") +
    makeStatCard("feelsLike", "Feels Like", Math.round(current.apparent_temperature) + "\u00B0");

  // Hourly (next 24h)
  var container = $("#hourly-temp-chart");
  container.innerHTML = "";
  var now = new Date();
  var currentHourIndex = hourly.time.findIndex(function(t) { return new Date(t) >= now; });
  var startIdx = Math.max(currentHourIndex, 0);
  for (var i = startIdx; i < startIdx + 24 && i < hourly.time.length; i++) {
    var info = getWeatherInfo(hourly.weather_code ? hourly.weather_code[i] : daily.weather_code[0]);
    var div = document.createElement("div");
    div.className = "hour-item";
    div.innerHTML =
      '<span class="hour-time">' + (i === startIdx ? "Now" : formatHour(hourly.time[i])) + "</span>" +
      '<span class="hour-icon">' + info.icon + "</span>" +
      '<span class="hour-temp">' + Math.round(hourly.temperature_2m[i]) + "\u00B0</span>";
    container.appendChild(div);
  }

  // Daily
  var dailyList = $("#daily-temp-list");
  dailyList.innerHTML = "";
  var allMaxes = daily.temperature_2m_max;
  var allMins = daily.temperature_2m_min;
  var globalMin = Math.min.apply(null, allMins);
  var globalMax = Math.max.apply(null, allMaxes);
  var globalRange = globalMax - globalMin || 1;

  for (var j = 0; j < daily.time.length; j++) {
    var dInfo = getWeatherInfo(daily.weather_code[j]);
    var left = ((allMins[j] - globalMin) / globalRange) * 100;
    var width = ((allMaxes[j] - allMins[j]) / globalRange) * 100;
    var row = document.createElement("div");
    row.className = "daily-row";
    row.innerHTML =
      '<span class="daily-day">' + (j === 0 ? "Today" : formatDay(daily.time[j])) + "</span>" +
      '<span class="daily-icon">' + dInfo.icon + "</span>" +
      '<div class="daily-temps">' +
        '<span class="daily-low">' + Math.round(allMins[j]) + "\u00B0</span>" +
        '<div class="daily-bar-wrap"><div class="daily-bar" style="left:' + left + "%;width:" + width + '%"></div></div>' +
        '<span class="daily-high">' + Math.round(allMaxes[j]) + "\u00B0</span>" +
      "</div>";
    dailyList.appendChild(row);
  }
}

function renderConditionsView(data) {
  var current = data.current;
  var hourly = data.hourly;
  var daily = data.daily;

  // Current conditions
  var info = getWeatherInfo(current.weather_code);
  $("#current-condition-icon").textContent = info.icon;
  $("#current-condition-text").textContent = info.desc;
  $("#current-condition-desc").textContent = "Current weather conditions";

  // Stat cards
  $("#cond-stat-cards").innerHTML =
    makeStatCard("humidity", "Humidity", current.relative_humidity_2m + "%") +
    makeStatCard("wind", "Wind", Math.round(current.wind_speed_10m) + " mph") +
    makeStatCard("precipitation", "Precipitation", current.precipitation + " mm") +
    makeStatCard("uv", "UV Index", current.uv_index !== undefined ? current.uv_index.toFixed(1) : "N/A");

  // Hourly conditions
  var container = $("#hourly-cond-chart");
  container.innerHTML = "";
  var now = new Date();
  var currentHourIndex = hourly.time.findIndex(function(t) { return new Date(t) >= now; });
  var startIdx = Math.max(currentHourIndex, 0);
  for (var i = startIdx; i < startIdx + 24 && i < hourly.time.length; i++) {
    var hInfo = getWeatherInfo(hourly.weather_code[i]);
    var div = document.createElement("div");
    div.className = "hour-item";
    div.innerHTML =
      '<span class="hour-time">' + (i === startIdx ? "Now" : formatHour(hourly.time[i])) + "</span>" +
      '<span class="hour-icon">' + hInfo.icon + "</span>" +
      '<span class="hour-temp">' + Math.round(hourly.wind_speed_10m[i]) + " mph</span>" +
      '<span class="hour-detail">' + (hourly.precipitation_probability[i] || 0) + "%</span>";
    container.appendChild(div);
  }

  // Daily conditions
  var dailyList = $("#daily-cond-list");
  dailyList.innerHTML = "";
  for (var j = 0; j < daily.time.length; j++) {
    var dInfo = getWeatherInfo(daily.weather_code[j]);
    var row = document.createElement("div");
    row.className = "daily-row";
    row.innerHTML =
      '<span class="daily-day">' + (j === 0 ? "Today" : formatDay(daily.time[j])) + "</span>" +
      '<span class="daily-icon">' + dInfo.icon + "</span>" +
      '<div class="daily-cond-extras">' +
        "<span>\uD83D\uDCA8 " + Math.round(daily.wind_speed_10m_max[j]) + " mph</span>" +
        "<span>\uD83C\uDF27\uFE0F " + (daily.precipitation_probability_max[j] || 0) + "%</span>" +
        "<span>\uD83D\uDCA7 " + daily.precipitation_sum[j].toFixed(2) + " in</span>" +
      "</div>";
    dailyList.appendChild(row);
  }
}

// View switching & fetching
const viewWrapper = document.getElementById("view-wrapper");
const navIndicator = document.getElementById("nav-indicator");

function applyViewSlide() {
  if (state.currentView === "conditions") {
    viewWrapper.classList.add("show-conditions");
  } else {
    viewWrapper.classList.remove("show-conditions");
  }
}

async function fetchCurrentView(isTabSwitch) {
  if (!state.location) return;
  var lat = state.location.latitude;
  var lon = state.location.longitude;

  if (!isTabSwitch) {
    showLoading();
  }
  renderLocationHeader();

  try {
    if (state.currentView === "temperature") {
      var tempData = await fetchTemperatureData(lat, lon);
      renderTemperatureView(tempData);
    } else {
      var condData = await fetchConditionsData(lat, lon);
      renderConditionsView(condData);
    }
    if (!isTabSwitch) {
      showContent();
      applyViewSlide();
    }
  } catch (err) {
    showError("Unable to fetch weather data. Please try again. (" + err.message + ")");
  }
}

function switchView(view) {
  if (state.currentView === view) return;
  state.currentView = view;
  navTemp.classList.toggle("active", view === "temperature");
  navCond.classList.toggle("active", view === "conditions");
  // Apply slide immediately so the animation plays while data loads in background
  applyViewSlide();
  navIndicator.classList.toggle("at-conditions", view === "conditions");
  fetchCurrentView(true);
}

// Event Listeners
navTemp.addEventListener("click", function() { switchView("temperature"); });
navCond.addEventListener("click", function() { switchView("conditions"); });

cityInput.addEventListener("input", function() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(function() { searchCities(cityInput.value.trim()); }, 300);
});

cityInput.addEventListener("focus", function() {
  if (cityInput.value.trim().length >= 2 && suggestionsEl.children.length > 0) {
    suggestionsEl.classList.remove("hidden");
  }
});

cityInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    suggestionsEl.classList.add("hidden");
    searchCities(cityInput.value.trim()).then(function() {
      var first = suggestionsEl.querySelector(".suggestion-item");
      if (first) first.click();
    });
  }
});

searchBtn.addEventListener("click", function() {
  suggestionsEl.classList.add("hidden");
  searchCities(cityInput.value.trim()).then(function() {
    var first = suggestionsEl.querySelector(".suggestion-item");
    if (first) first.click();
  });
});

// Close suggestions on outside click
document.addEventListener("click", function(e) {
  if (!e.target.closest(".search-container")) {
    suggestionsEl.classList.add("hidden");
  }
});

// Unit toggle
unitToggle.addEventListener("click", function() {
  state.useFahrenheit = !state.useFahrenheit;
  unitToggle.innerHTML = state.useFahrenheit ? "\u00B0F \u2192 \u00B0C" : "\u00B0C \u2192 \u00B0F";
  if (state.location) fetchCurrentView();
});

// Default Load
(function init() {
  selectCity({
    name: "New York",
    latitude: 40.7143,
    longitude: -74.006,
    country: "United States",
    admin1: "New York",
  });
})();
