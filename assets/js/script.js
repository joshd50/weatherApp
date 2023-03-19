
document.addEventListener('DOMContentLoaded', function() {
    initAutocomplete();
}, false);

let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
            types: ['(cities)'],
            fields: ['place_id', 'geometry', 'name']
        });
    autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged () {
    var place = autocomplete.getPlace();

    if (!place.geometry) {
        // user did not select a prediction; reset the input field
        document.getElementById('autocomplete').placeholder = 
        'Enter a place';
    } else {
        //  display details about the vailid place
        console.log(place.geometry.location.lat(), place.geometry.location.lng());
    }
}
 