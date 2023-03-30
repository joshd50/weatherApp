
// Initialize the autocomplete once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAutocomplete();
}, false);
// google.maps.event.addDomListener(window, 'load', initAutocomplete);

// history tabs as selectable
$( function() {
    $( "#selectable" ).selectable();
} );

let autocomplete;
let cities = []
let hourlyDisplay = []
let hourlyTime = []
let hourlyCond = []

// Autocomplete function
function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
            types: ['(cities)'],
            fields: ['geometry', 'name', 'address_components']
        });
    autocomplete.addListener('place_changed', onPlaceChanged);
}


function onPlaceChanged () {
    var place = autocomplete.getPlace();

    if (!place.geometry) {
        // user did not select a prediction; reset the input field
        document.getElementById('autocomplete').placeholder = 
        'Enter a city';
    } else {
        //  display details about the vailid place
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        var name = place.name;
        var state = '';
        var country = '';

        getWeather(lat, lng)

        // loop through the address components to find the state and country
        for (var i = 0; i < place.address_components.length; i++) {
            var component = place.address_components[i];

            if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
            } else if (component.types.includes('country')) {
                country = component.long_name;
            }

        }
        // stylize the city data for button display
        if (country == "United States") {
            country = "USA";
            state = ", " + state + ", ";
            name = name.trim();
        } else {
            state = ", "
            name = name.trim()
            country = " " + country
        }

        var city = {
            location: {
                name: name,
                state: state,
                country: country
            },
            geometry: {
                lat: lat,
                lng: lng
            }
        };
        // add the city object to the cities array
        cities.push(city);

        // save the cities array in local storage
        localStorage.setItem('cities', JSON.stringify(cities));
        renderCityList();
    }
}
function renderCityList(){
    // clear the existing list
    $('#selectable').empty();

    // retrieve the cities array from local storage
    cities = JSON.parse(localStorage.getItem('cities')) || [];
        if (cities !== null) {
        // loop through the cities array and create an li for each city
        for (var i = 0; i < cities.length; i++) {
            var city = cities[i];


            var newCity = $('<li>');
            newCity.text(city.location.name + city.location.state + ' ' + city.location.country);
            newCity.attr("data-lat", city.geometry.lat);
            newCity.data("lng", city.geometry.lng);
            newCity.attr("data-lng", city.geometry.lng);
            newCity.click(function() {
                $('#title')[0].scrollIntoView({ behavior: 'smooth' });
            });


            closeButton = $('<button>')
            closeButton.attr("type", "button");
            closeButton.addClass ('btn-close btn-close-white')
            closeButton.attr('aria-label', "Close" )

            // add event listener to the close button
            closeButton.click(function(event) {
                var index = $(this).parent().index();
                // remove the city from the cities array
                cities.splice(index, 1);

                // save the updated cities array in local storage
                localStorage.setItem('cities', JSON.stringify(cities));

                // re-render the city list
                renderCityList();
            });

            newCity.append(closeButton)
            $('#selectable').append(newCity)

            // clear input
            document.getElementById('autocomplete').value = '';

            // getWeather(city.geometry.lat,city.geometry.lng);
        }
        
    }
}

function getWeather(lat, lng){
    var requestForecast = 'https://api.weatherapi.com/v1/forecast.json?key=b53d7b780ee34c219e6164023231903&days=7'
    var geometry = '&q=' + lat + ',' + lng
    var requestUrl = requestForecast + geometry;

    // send a fetch request to get the forecast weather data
    fetch(requestUrl)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to get forecast weather data.');
            }
            return response.json();
        })
        .then(function(data) {
            // handle the response data
            appendWeather(data);
        })
        .catch(function(error) {
            console.log('Error: ' + error.message);
        })
}

// enters data into main card
function appendWeather(data) {
    hourlyDisplay= []
    hourlyCond = []
    hourlyTime = []

    // display city name
    var cityName = $('#city-name')
    cityName.text(data.location.name)

    // display temp
    var currentTemp = $('#current-temp')
    currentTemp.text(data.current.temp_f + '\xBA')
    var condition = $('#condition')
    condition.text(data.current.condition.text)
    // display location time
    var currentTime= ""
    currentTime = $('#current-time')
    currentTime.text(dayjs(data.location.localtime).format('h:mm a'))

    // set current time to location selected
    var currentHour = ''
    currentHour = parseInt(dayjs(data.location.localtime).format('H'));

    // get the remaining hours of today
    for (var i = currentHour; i <= 23; i++) {
        var todayHourData = data.forecast.forecastday[0].hour[i].temp_f;
        var todayMatchTime = data.forecast.forecastday[0].hour[i].time;
        var todayMatchCond = 'https:' + data.forecast.forecastday[0].hour[i].condition.icon;
        hourlyDisplay.push(todayHourData);
        todayMatchTime = dayjs(todayMatchTime).format('ha')
        hourlyTime.push(todayMatchTime)
        hourlyCond.push(todayMatchCond)
    }
    // get the reamining hours from tomorrow to complete 24 hour forecast
    for (var x = 0; x < currentHour; x++) {
        var tomHourData = data.forecast.forecastday[1].hour[x].temp_f
        hourlyDisplay.push(tomHourData)

        var tomMatchTime = data.forecast.forecastday[1].hour[x].time
        tomMatchTime = dayjs(tomMatchTime).format('ha')
        hourlyTime.push(tomMatchTime)

        var tomMatchCond = 'https:' + data.forecast.forecastday[1].hour[x].condition.icon;
        hourlyCond.push(tomMatchCond)
    }

    // loop through hourly arrays
    $("#hourly-forecast").empty();

    for (var d = 0; d < hourlyDisplay.length; d++) {
        var hourTime = hourlyTime[d];
        var hourDisplay = hourlyDisplay[d];
        var hourCond = hourlyCond[d];
        
        // create hourly HTML
        var showHourTime = $('<p>').text(hourTime)
        var showHourCond = $('<img>').attr('src', hourCond)
        var showHourTemp = $('<p>').text(hourDisplay)

        // append hourly data
        var hourDiv = $('<div>')
        hourDiv.append(showHourTime)
        hourDiv.append(showHourCond)
        hourDiv.append(showHourTemp)
        // add hourly to hour div
        $("#hourly-forecast").append(hourDiv)
    }

    $("#day-forecast").empty();
    // 7 day forecast loop
    for (var f = 1; f < 7; f++) {
        var dayDate = dayjs(data.forecast.forecastday[f].date).format('ddd')
        var dayForecastHigh = data.forecast.forecastday[f].day.maxtemp_f
        var dayForecastLow = data.forecast.forecastday[f].day.mintemp_f

        var dailyFore = $('<div>');
        dailyFore.addClass('daily-fore');
        var dailyForeDate = $('<p>').text(dayDate)
        var dailyForeHigh = $('<p>').text('High: ' + dayForecastHigh + "\xBA")
        var dailyForeLow = $('<p>').text('Low: ' + dayForecastLow + "\xBA")

        var condImg = $('<img>')
        var src1 = 'https:' + data.forecast.forecastday[f].day.condition.icon
        condImg.attr('src', src1)

        dailyFore.append(dailyForeDate)
        dailyFore.append(condImg)
        dailyFore.append(dailyForeHigh)
        dailyFore.append(dailyForeLow)

        $('#day-forecast').append(dailyFore)
    }

}

renderCityList()

$(document).ready(function() {

    // add event listener to selectable list
    $('#selectable').on('selectableselected', function(event, ui) {
    // get lat and lng data from selected list item
    var lat = ui.selected.dataset.lat;
    var lng = ui.selected.dataset.lng;
    

    // call getWeather with lat and lng data
    getWeather(lat, lng);
    });
});

