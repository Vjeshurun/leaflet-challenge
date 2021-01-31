// store geoJSON
var earthquakeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// perform a GET request to the query URL
d3.json(earthquakeURL).then((data) => {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data.features);
});

function createMap(earthquakes) {
    // assign the different mapbox styles
    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // // var grayscale = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    // //     maxZoom: 20,
    // //     id: 'light-v9',
    // //     accessToken: API_KEY
    // });

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.outdoors',
        accessToken: API_KEY
    });


    var mapboxTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=', {
        attribution: '<a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });


    var baseMap = {
        'Satellite': satellite,
        'Street Map': streetmap,
        'Outdoors': outdoors,
        "Dark Map": darkmap
    };

    var overlayMap = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map('map', {
        center: [36.7126875, -120.476189],
        zoom: 5,
        layers: [outdoors, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMap, overlayMap, {
        collapsed: false
    }).addTo(myMap);

    // function to assign colors for legend and markers
    function getColor(d) {
        return d > 5 ? '#f06b6b' :
            d > 4 ? '#f0936b' :
            d > 3 ? '#f3ba4e' :
            d > 2 ? '#f3db4c' :
            d > 1 ? '#e1f34c' :
            '#b7f34d';
    }

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(myMap) {
        const div = L.DomUtil.create('div', 'info legend')
        const magnitudes = [0, 1, 2, 3, 4, 5]
        const labels = []

        for (let i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i>' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }
        return div
    };
    legend.addTo(myMap);

}

function createFeatures(eqdata) {
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h4>" + feature.properties.place + "</h4><hr><p>" + new Date(feature.properties.time) + "</h4><h4>Magnitude: " + feature.properties.mag + "</h4><h4>USGS Event Page: <a href=" + feature.properties.url + " target='_blank'>Click here</a></h4>", { maxWidth: 400 })
    }


    var layerToMap = L.geoJSON(eqdata, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            let radius = feature.properties.mag * 4.5;

            if (feature.properties.mag > 5) {
                fillcolor = '#f06b6b';
            } else if (feature.properties.mag >= 4) {
                fillcolor = '#f0936b';
            } else if (feature.properties.mag >= 3) {
                fillcolor = '#f3ba4e';
            } else if (feature.properties.mag >= 2) {
                fillcolor = '#f3db4c';
            } else if (feature.properties.mag >= 1) {
                fillcolor = '#e1f34c';
            } else fillcolor = '#b7f34d';

            return L.circleMarker(latlng, {
                radius: radius,
                color: 'black',
                fillColor: fillcolor,
                fillOpacity: 1,
                weight: 1
            });
        }
    });
    createMap(layerToMap);
}