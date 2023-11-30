const searchButton = document.querySelector(".search-btn")
const locationButton = document.querySelector(".location-btn")
const cityInput = document.querySelector(".city-input")
const weatherCardsDiv = document.querySelector(".weather-cards")
const currentWeatherDiv = document.querySelector(".current-weather")
const API_KEY = '37ad3500d11384349ad8cbf6b87201fa' //API key for OpenWeahterMap API


const createWeatherCard = (cityName, weatherItem, index) =>{
    if(index === 0 ){
        return`<div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h3>
                <h4>temp:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>wind: ${weatherItem.wind.speed}m/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                  <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon" class="forcast-img">
                  <h4>${weatherItem.weather[0].description}</h4>
              </div>
            `
    }else{
        return`<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon" class="forcast-img">
                    <h4>temp:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>wind: ${weatherItem.wind.speed}m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`
    }
}

const getWeatherDetails = (cityName, lat, long) =>{
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${long}&appid=${API_KEY}`
    
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        
        //Filter the forecasts to get only one forecast per day 
        const uniqueForecastDays = []
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
               return uniqueForecastDays.push(forecastDate)
            }
        })

        // cleaning previous
        cityInput.value = "";
        weatherCardsDiv.innerHTML = "",
        currentWeatherDiv.innerHTML = "",

        fiveDaysForecast.forEach((weatherItem ,index) => {
            
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }
        })
    }).catch(() => {
        alert("an error accured while prediciting the forecast LOL :) ")
    })
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return(alert("enter a valid city name pls"));
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return (alert(`no coordonate found for ${cityName}`))
        const {name , lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("an error occured while fetching the coordinate :( !")
    })
}

const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position => {
           const {latitude, longitude } = position.coords ; //Get coordinates of user loction
           const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}` ;
           
           //Get City name from coordinates using reverse geocoding API
           fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
           const cityName =  data[0].name
            getWeatherDetails(cityName, latitude, longitude)
            }).catch(() => {
                alert("an error occured while fetching the city :( !")
            })
        },
        error =>{ //Show alert if user denied the location permission
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denide. Please resat location permission to grant access again.")
            }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates)
searchButton.addEventListener("click", getCityCoordinates)
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates())