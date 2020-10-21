// Earthquake and Techtonic Plate URLs
var earthqakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var techplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// // Initialize & Create Two Separate LayerGroups: Basketball & Football
//     var earthquakesLayer = L.layerGroup(earthquakeMarkers);
//     


// Create a function to use for the marker size
function markerSize(magnitude) {
    return magnitude * 40000;
}

// Perform a GET request to the query URL
d3.json(earthqakeUrl, function(data){
    console.log(data)
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

    // Creat a function that will initialize are data for the map
    function createFeatures(data) {
        
        // Create an empty markers array to push the desired data into
        var earthquakeMarkers = [];

        // Begin loop to itterate through the earthquake data
        for (var i = 0; i < data.length; i++){
            
            // Establish variables from the geojson data to utilize
            var depth = data[i].geometry.coordinates[2];
            var color = "";
            var lng = data[i].geometry.coordinates[0];
            var lat = data[i].geometry.coordinates[1];
            var lat_lng = [lat, lng];
            // console.log(depth)

            // Create an function w/ switch to determint the colors of the Earthquake markers based off depth
            function markerColor(depth) {
                switch (true) {
                case depth < 10:
                    return "lime";
                case depth < 30:
                    return "green";
                case depth < 50:
                    return "yellow";
                case depth < 70:
                    return "orange";
                case depth < 90:
                    return "red";
                default:
                    return "maroon";
                };
            };

            // Push the data to the markers layer and Give each feature a popup describing the place and time of the earthquake
            earthquakeMarkers.push(
                L.circle(lat_lng, {
                    fillOpacity: 0.75,
                    color: "white",
                    fillColor: markerColor(depth),
                    stroke: false,
                    radius: markerSize(data[i].properties.mag)
                }).bindPopup("<h3>" + data[i].properties.title + "</h3><hr><h3>"  
                    +"<h3>" + new Date(data[i].properties.time) + "</h3>")
            );
        };

        // Set our Earthquak lare group to call into our creat map function
        var earthquakesLayer = L.layerGroup(earthquakeMarkers);

        // Sending our earthquakes layer to the createMap function
        createMap(earthquakesLayer)
    }

    function createMap(earthquakesLayer) {

        // Define satellite, darkmap, and outdoors layers
        var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.satellite",
            accessToken: API_KEY
        });
        
        var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
          attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
          maxZoom: 18,
          id: "dark-v10",
          accessToken: API_KEY
        });
        
        var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "outdoors-v11",
            accessToken: API_KEY
        });

        var techPlatesLayer = L.layerGroup();

        // Grabbing our GeoJSON data
        d3.json(techplatesURL, function(data1){
            // console.log(techplatesURL)
            // Creating a GeoJSON layer with the retrieved data
            L.geoJson(data1, {
                style: "orange"
            }).addTo(techPlatesLayer)
        });
      
        // Create Overlay Object to Hold Overlay Layers
        var overlayMaps = {
            Earthquake: earthquakesLayer,
            Fault_Lines: techPlatesLayer
        };

        // Create our map, giving it the satellite and earthquakes and techtonic plates layers to display on load
        var myMap = L.map("map",{
            center: [35, -35],
            zoom: 2,
            layers: [satelliteMap, earthquakesLayer, techPlatesLayer]
        });

        // // Define baseMaps Object to Hold Base Layers
        var baseMaps = {
            "Satellite": satelliteMap,
            "Dark": darkMap,
            "Outdoors": outdoorsMap
        };

        // Create a layer control
        // Pass in our baseMaps and overlayMaps
        // Add the layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
          collapsed: false
        }).addTo(myMap);

        // Set up the legend
        var legend = L.control({ position: "bottomright", fillcolor: "white" });
        legend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var depth = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
            var labels = ["lime", "green", "yellow", "orange", "red", "maroon"]

            div.innerHTML = '<p>Depth</p'

            for (var i = 0; i < depth.length; i++) {
                div.innerHTML += '<i style="background:' + labels[i] + '"></i> ' + depth[i]+ " <br> "
            }
        return div;
        }
        // Adding legend to the map
        legend.addTo(myMap)
    }