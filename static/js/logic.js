// Create the tile layers
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  //call api key from config.js
  accessToken: API_KEY
});

let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the map, giving it the streetmap and earthquakes layers to display on load.
let map = L.map('mapid', {
	center: [20.0, -4.0],
	zoom: 2,
	layers: [streets]
});

console.log(map);

// Create a baseMaps object.
let baseMaps = {
  "Street Map": streets,
  "Topographic Map View": topo,
    Satellite: satellite,
    Dark: dark,
};

// Add a layer group for the tectonic plate data.
let allEarthquakes = new L.LayerGroup();
let tectonicPlates = new L.layerGroup();

// Add Tectonic Plates option to the map
let overlays = {
  "Tectonic Plates": tectonicPlates,
  "Earthquakes": allEarthquakes
  };

// Create a layer control to the map, pass baseMaps and Overlaymaps. This gives the user ability to change which layers are visible.
L.control
  .layers(baseMaps, overlays, {
    collapsed: false,
  })
  // Add the layer control to the map.
  .addTo(map);

// Get the earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

// Return the style data for each of the earthquakes plotted on the map & pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
  
  // Assign the markers a colour based on the magnitude of the earthquake.
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#4B0082"; // Indigo
    }
    if (magnitude > 4) {
      return "#4169E1"; // RoyalBlue
    }
    if (magnitude > 3) {
      return "#F08080"; // LightCoral
    }
    if (magnitude > 2) {
      return "#F7FE2E"; // yellow
    }
    if (magnitude > 1) {
      return "#FF8000"; // orange
    }
    return "#DF0101"; // red
  }

  // Get the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }
// Creating a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
  // Insert marker for each earthquake on OpenStreetMap
    pointToLayer: function(feature, latlng) {
      console.log(data);
      return L.circleMarker(latlng);
    },
    // Style circleMarker using styleInfo function.
  style: styleInfo,
     // Create popup for each circleMarker to display the magnitude and location of the earthquake
      onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(allEarthquakes);
  // Then we add the earthquake layer to our map.
  allEarthquakes.addTo(map);
  // 3. Retrieve the major earthquake GeoJSON data >4.5 mag for the week.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function(data) {

 // Use the same style as the earthquake data.
function styleInfo(feature) {
  return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: getColor(feature.properties.mag),
    color: "#000000",
    radius: getRadius(feature.properties.mag),
    stroke: true,
    weight: 0.5
  };
}
 
// Use the function that determines the radius of the earthquake marker based on its magnitude.
function getRadius(magnitude) {
  if (magnitude === 0) {
    return 1;
  }
  return magnitude * 4;
}
 
// GeoJSON layer with the retrieved data that adds a circle to the map and displays the magnitude and location of the earthquake
L.geoJson(data, {
  pointToLayer: function(feature, latlng) {
    console.log(data);
    return L.circleMarker(latlng);
  },
  style: styleInfo,
  onEachFeature: function(feature, layer) {
  layer.bindPopup("Magnitude: "+ feature.properties.mag  + "<br>Location: "+feature.properties.place );
  }
})
});
 
// create a legend control object.
let legend = L.control({
  position: "bottomright"
});

// Add all the details for the legend
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");

const magnitudes = [0, 1, 2, 3, 4, 5];
const colors = [
  "#DF0101",
  "#FF8000",
  "#F7FE2E",
  "#F08080",
  "#4169E1",
  "#4B0082"
];

// generate a label with a colored square for each interval.
for (var i = 0; i < magnitudes.length; i++) {
  console.log(colors[i]);
  div.innerHTML +=
    "<i style='background: " + colors[i] + "'></i> " +
    magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
  }
  return div;
};

// Add legend to the map.
legend.addTo(map);


// Use d3.json to make a call to get Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(data) {
 
  function styleTectonic(feature){
    return {
      opacity: 1,
      color: "#ea822c", // orange
      weight: 2
    };
  }
 
  L.geoJson(data,{
    pointToLayer: function(feature, latlng) {
    console.log(data);
   },
  //set the style for each circleMarker using our styleInfo function.
  style: styleTectonic,
   }).addTo(tectonicPlates)
       
  // add the tectonic plates layer to our map.
  tectonicPlates.addTo(map);
 });

});
