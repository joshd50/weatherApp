
document.addEventListener('DOMContentLoaded', function() {
    initAutocomplete();
}, false);

  $( function() {
    $( "#selectable" ).selectable();
  } );

let autocomplete;


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
            country = ", USA";
            state = ", " + state;
            name = name.trim();
        } else {
            state = ","
            name = name.trim()
        }
        console.log(lat, lng);
        // 34.0522342 -118.2436849
        console.log(name, state, country);

        newCity = $('<li>');
        newCity.text(name + state + country);
        newCity.data("lat", lat);
        newCity.data("lng", lng);
        newCity.addClass("ui-widget-content")

        closeButton = $('<button>')
        closeButton.attr("type", "button");
        closeButton.addClass ('btn-close btn-close-white')
        closeButton.attr('aria-label', "Close" )

        newCity.append(closeButton)
        $('#selectable').append(newCity)

        // clear input
        document.getElementById('autocomplete').value = '';

        getWeather(lat,lng);
    }
}

function getWeather(lat, lng){
    var requestCurrent = 'http://api.weatherapi.com/v1/current.json?key=b53d7b780ee34c219e6164023231903'
    var requestForecast = 'http://api.weatherapi.com/v1//forecast.json?key=b53d7b780ee34c219e6164023231903'


}
