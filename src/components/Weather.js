// src/components/Weather.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather.css'; 

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [populousCitiesWeather, setPopulousCitiesWeather] = useState([]);
  const API_KEY = '0d7eb33bd83d1e9f54e57e7bdbbb1dc1';

  const populousCities = [
    { city: 'New York', state: 'NY' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'Chicago', state: 'IL' },
    { city: 'Houston', state: 'TX' },
    { city: 'Phoenix', state: 'AZ' },
  ];

  useEffect(() => {
    const fetchPopulousCitiesWeather = async () => {
      try {
        const weatherPromises = populousCities.map(async ({ city, state }) => {
          const GEO_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${API_KEY}`;
          const geoResponse = await axios.get(GEO_URL);
          if (geoResponse.data.length === 0) {
            throw new Error(`Location not found for ${city}, ${state}`);
          }
          const { lat, lon } = geoResponse.data[0];
          const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
          const weatherResponse = await axios.get(WEATHER_URL);
          return { city, state, weather: weatherResponse.data };
        });

        const weatherData = await Promise.all(weatherPromises);
        setPopulousCitiesWeather(weatherData);
      } catch (error) {
        console.error('Error fetching weather data for populous cities', error);
      }
    };

    fetchPopulousCitiesWeather();
  }, []);

  const fetchCoordinates = async () => {
    const GEO_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${API_KEY}`;

    try {
      const response = await axios.get(GEO_URL);
      if (response.data.length === 0) {
        throw new Error('Location not found');
      }
      return response.data[0];
    } catch (error) {
      throw new Error('Error fetching coordinates');
    }
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const coordinates = await fetchCoordinates();
      const { lat, lon } = coordinates;
      const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

      const response = await axios.get(WEATHER_URL);
      setWeatherData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-app">
      <h1>Weather App</h1>
      
      <div className="cities-container">
        <h2>Top 5 Most Populous Cities Weather</h2>
        <div className="cities">
          {populousCitiesWeather.map(({ city, state, weather }) => (
            <div key={city} className="city-card">
              <h3>{city}, {state}</h3>
              <p>Temperature: {weather.main.temp} °C</p>
              <p>Weather: {weather.weather[0].description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="search-container">
        <h2>Search Weather</h2>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
        />
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="Enter state"
        />
        <button onClick={fetchWeather}>Get Weather</button>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {weatherData && (
          <div>
            <h2>{weatherData.name}</h2>
            <p>Latitude: {weatherData.coord.lat}</p>
            <p>Longitude: {weatherData.coord.lon}</p>
            <p>Temperature: {weatherData.main.temp} °C</p>
            <p>Weather: {weatherData.weather[0].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;