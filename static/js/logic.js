
// URLS with JSON/GEOJSON? info

let URL1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

let URL2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// makes a mappy boy

renderMap(URL1, URL2);

function renderMap(URL1, URL2) {

    // turns data into readable info
    d3.json(URL1, function(data) {
        console.log(URL1)

        let quakeData = data;
        // same as above
        d3.json(URL2, function(data) {
            let lineInfo = data;
            addons(quakeData, lineInfo);
        };
    });


    function addons(quakeData, lineInfo) {

        //popups
        function eachStack(feature, layer) {
            return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                fillOpacity: .5,
                color: colorOf(feature.properties.mag),
                fillColor: colorOf(feature.properties.mag),
                radius:  cirSize(feature.properties.mag),
                CANVAS: true,
                SVG: false

            });
        }
        function test2(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }

        //bonus fault lines
        function test1(feature, layer) {
            L.polyline(feature.geometry.coordinates);
        }


        let earthQuakes = L.geoJSON(quakeData, {
            onEachFeature: test2,
            pointToLayer: eachStack
        });

        //allows me to change fault colors and GEOjson the line
        let fLine = L.geoJSON(lineInfo, {
            onEachFeature: test1,
            style: {
                weight: 3,
                color: 'pink'
            }
        });

        //calling function from above
        createMap(earthQuakes, fLine);
    }

    // Function to create map
    function createMap(earthquakes, faultLines) {

        // Darkmap layer
        let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
            "access_token=pk.eyJ1IjoiZGF2aXNjYXJkd2VsbCIsImEiOiJjamViam4yMHEwZHJ4MnJvN3kweGhkeXViIn0." +
            "A3IKm_S6COZzvBMTqLvukQ");

        // Satellite layer
        let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
            "access_token=pk.eyJ1IjoiZGF2aXNjYXJkd2VsbCIsImEiOiJjamViam4yMHEwZHJ4MnJvN3kweGhkeXViIn0." +
            "A3IKm_S6COZzvBMTqLvukQ");



        // base
        let baseMaps = {

            "Satellite": satellite,
            "Dark Map": darkmap,
        };

        // selector
        let overlayMaps = {
            "Earthquakes": earthquakes,
            "Fault Lines": faultLines
        };

        // set map to default in Philipines and made it a canvas so it didnt murder my computer when I refreshed the page or moved the map
        let map = L.map("map", {
            center: [12, 121],
            zoom: 4,
            layers: [darkmap, earthquakes],
            preferCanvas: true
        });


        L.control.layers(baseMaps, overlayMaps, {
            collapsed: true
        }).addTo(map);

        // Adds Legend
        let NPH = L.control({position: 'bottomleft'});
        NPH.onAdd = function(map) {
            let div = L.DomUtil.create('div', 'Neil Patrick Harris'),
                labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5++"],
                grades = [0, 1, 2, 3, 4, 5];

            //google-foo to make the legend (aka Neil Patrick Harris) more readable

            for (let i = 0; i < grades.length; i++) {
                div.innerHTML += '<i style="background:' + colorOf(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };
        NPH.addTo(map);

    }
}

//found a function for making a color function
function colorOf(magnitude) {
    return magnitude > 5 ? "purple":
        magnitude > 4 ? "red":
            magnitude > 3 ? "orange":
                magnitude > 2 ? "gold":
                    magnitude > 1 ? "yellow":
                        "lightblue"; // <= 1 default
}

// make it easier to see
function cirSize(magnitude) {
    return magnitude * 3;
}