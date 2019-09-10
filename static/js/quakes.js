// store the API endpoint inside variable queryUrl
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// do a GET request to queryURL
d3.json(queryUrl, function(data) {
  // send data.features object from GeoJSON to createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // define the onEachFeature function 
  // give each feature a Popup of details describing the place, time & magnitude of each earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Location: " + feature.properties.place +
      "</h3><hr><p>Time: " + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  // create a GeoJSON layer to hold the features array on the earthquakeData object
  // run the function onEachFeature for each item in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      let geojsonMarkerOptions = {
        radius: 5 * feature.properties.mag,
        fillColor: getColor(feature.properties.mag),
        weight: 1,
        fillOpacity: 0.75
      };
      return L.circleMarker(latlng, geojsonMarkerOptions)
    }
  });

  // send the earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Create a getColor function for fillColor and legend
function getColor(color) {
  return color <= 1 ? '#25E500' :
    color <= 2 ? '#6FDD00' :
    color <= 3 ? '#B4D500' :
    color <= 4 ? '#CEA800' :
    color <= 5 ? '#C65E00' :
    '#BF1900' ;
}

function createMap(earthquakes) {

  // define the layers for streetmap and darkmap
  let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  let lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // define an object for baseMaps to hold the base layers
  let baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Street Map": streetmap
  };

  // create an overlay object to hold overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // create the map and use the darkmap and earthquakes layers on pageload... because i like how it looks...
  let myMap = L.map("map", {
    center: [
      33.605210, -7.620411
      // look up the geo coords on google maps, I think It's Rick Blaine's favorite spot... (Mr. "Play it again Sam")
    ],
    zoom: 3,
    layers: [darkmap, earthquakes]
  });

  // add layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // add the legend
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
      let div = L.DomUtil.create('div', 'info legend'),
      levels = [0, 1, 2, 3, 4, 5],
      labels = [];
  
      // loop through magnitude ranges to generate legend values
      for (let i = 0; i < levels.length; i++) {
          div.innerHTML +=
          labels.push(
            '<i style="background:' + getColor(levels[i] + 1) + '">.   .</i> ' + // <-- I very much dislike that part
            levels[i] + (levels[i + 1] ? ' to ' + levels[i + 1] + '<br>' : '+'));
    }
    div.innerHTML = '<h3>Magnitudes</h3><br>' + labels.join('<br>');

    return div;

  };

  // add the legend to the map
  legend.addTo(myMap);
}