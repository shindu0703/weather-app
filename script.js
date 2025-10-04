const apiKey = "f308f2432ee2a6b0f042288455b10dbe"; // 🔑 Replace with your OpenWeatherMap API Key

// Fetch weather by city
async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Enter a city name!");
  fetchWeatherData(city);
}

// Fetch weather by geolocation
function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        const data = await fetch(url).then((res) => res.json());
        displayWeather(data);
        getForecastByCoords(latitude, longitude);
      },
      () => alert("Location access denied!")
    );
  } else {
    alert("Geolocation not supported!");
  }
}

// Fetch weather by city name
async function fetchWeatherData(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    displayWeather(data);
    getForecast(city);
  } catch (error) {
    document.getElementById("weatherResult").innerHTML = `<p class="text-red-300">${error.message}</p>`;
  }
}

// Display current weather
function displayWeather(data) {
  document.getElementById("weatherResult").innerHTML = `
    <h2 class="text-2xl font-bold">${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" class="mx-auto drop-shadow-lg"/>
    <p class="text-3xl font-semibold">🌡 ${data.main.temp} °C</p>
    <p class="capitalize text-lg">🌤 ${data.weather[0].description}</p>
    <div class="grid grid-cols-3 gap-4 mt-4 text-sm">
      <div class="glass-card p-2">💧 Humidity <br><b>${data.main.humidity}%</b></div>
      <div class="glass-card p-2">💨 Wind <br><b>${data.wind.speed} m/s</b></div>
      <div class="glass-card p-2">🌡 Feels Like <br><b>${data.main.feels_like}°C</b></div>
    </div>
  `;
}

// Fetch 5-day forecast by city
async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  const data = await fetch(url).then((res) => res.json());
  displayForecast(data.list);
}

// Fetch forecast by coordinates
async function getForecastByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const data = await fetch(url).then((res) => res.json());
  displayForecast(data.list);
}

// Display forecast cards
function displayForecast(list) {
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";

  for (let i = 0; i < list.length; i += 8) {
    const day = list[i];
    const date = new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });

    forecastEl.innerHTML += `
      <div class="glass-card forecast-card p-4 text-center shadow-md">
        <h3 class="font-bold">${date}</h3>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" class="mx-auto"/>
        <p class="text-lg font-semibold">${day.main.temp}°C</p>
        <p class="text-sm capitalize">${day.weather[0].description}</p>
      </div>
    `;
  }
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
try { localStorage.setItem('lastWeatherData', JSON.stringify(data)); } catch(e) {}
function showOfflineIfAvailable(msg='') {
  const last = localStorage.getItem('lastWeatherData');
  if (last) {
    displayWeather(JSON.parse(last));
    // optionally show a small "offline" text on screen
    document.getElementById('weatherResult').insertAdjacentHTML('beforeend', `<p class="text-yellow-200">Showing cached data (offline)</p>`);
  } else {
    document.getElementById('weatherResult').innerHTML = `<p class="text-red-300">${msg || 'Offline and no cached data'}</p>`;
  }
}
