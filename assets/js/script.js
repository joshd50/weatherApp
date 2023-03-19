
document.addEventListener('DOMContentLoaded', function() {
    initAutocomplete();
}, false);

  $( function() {
    $( "#selectable" ).selectable();
  } );

let autocomplete;
let cities = []

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

        // loop through the address components to find the state and country
        for (var i = 0; i < place.address_components.length; i++) {
            var component = place.address_components[i];

            if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
            } else if (component.types.includes('country')) {
                country = component.long_name;
            }

        }
        if (country == "United States") {
            country = "USA";
            state = ", " + state + ", ";
            name = name.trim();
        } else {
            state = ", "
            name = name.trim()
            country = " " + country
        }
        console.log(lat, lng);
        // 34.0522342 -118.2436849
        console.log(name, state, country);

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
            console.log(cities.length)
        // loop through the cities array and create an li for each city
        for (var i = 0; i < cities.length; i++) {
            var city = cities[i];


            var newCity = $('<li>');
            newCity.text(city.location.name + city.location.state + ' ' + city.location.country);
            newCity.attr("data-lat", city.geometry.lat);
            newCity.data("lng", city.geometry.lng);
            newCity.attr("data-lng", city.geometry.lng);

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
    var requestForecast = 'http://api.weatherapi.com/v1/forecast.json?key=b53d7b780ee34c219e6164023231903&days=7'
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
        .finally(function() {
            // re-render the city list after the weather data has been retrieved
            // renderCityList();
        });
}

function appendWeather(data) {
    console.log(data)

    var cityName = $('#city-name')
    cityName.text(data.location.name)

    var currentTemp = $('#current-temp')
    currentTemp.text(data.current.temp_f + '\xBA')

    var condition = $('#condition')
    condition.text(data.current.condition.text)

    var currentTime = $('#current-time')
    currentTime.text(dayjs(data.location.localtime).format('h:mm a'))

    var currentHour = dayjs(data.location.localtime).format('H')
    var hoursLeft = 24 - currentHour
    var hourTom = currentHour
    console.log(hoursLeft + "tom" + hourTom)

    console.log(data.forecast.forecastday[0].hour[currentHour].temp_f)

for (var i = currentHour; i < hoursLeft; i++) {
    var todayHourData = data.forecast.forecastday[0].hour[i].temp_f;
    console.log(todayHourData);
}
}

renderCityList()

$(document).ready(function() {
  // ...
  
  // add event listener to selectable list
  $('#selectable').on('selectableselected', function(event, ui) {
    // get lat and lng data from selected list item
    var lat = ui.selected.dataset.lat;
    var lng = ui.selected.dataset.lng;

    // call getWeather with lat and lng data
    getWeather(lat, lng);
  });
});

