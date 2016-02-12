L.Icon.Default.imagePath = '/images';
L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
/* create leaflet map */
var cities, map = L.map('map', {
    center: [1.35, 103.8],
    zoom: 12
});

// ============================Open Streetmap Base========================================================
new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 15,
    attribution: 'Map data © <a href="https://www.openstreetmap.org">OpenStreetMap contributors</a>'
}).addTo(map);
// ============================Open Streetmap Base========================================================
// ============================GeoCoding========================================================
L.Control.geocoder().addTo(map);
// ============================GeoCoding========================================================

// ============================Marker Selection========================================================
var colorMarker = ['red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpuple', 'cadetblue'];
var markerName = ["automobile", "bank", "bar-chart", "beer", "bell", "bed", "calendar", "cloud", "coffee", "comment"];
proj4.defs("EPSG:3414", "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");
// var controlLayers = L.control.layers().addTo(map);
$.get("/getAllLayer", function(data) {
    var names = data;
    if (names.length === 0){
        $('#layerselection').append($('<option>').text("No Layer uploaded").attr('value', "no layer"));

    }else{
    for (var i = 0; i < names.length; i++) {
        var nameofLayer = names[i];
        $('#layerselection').append($('<option>').text(nameofLayer).attr('value', nameofLayer));

    }
}

})
for (var i = 1; i < colorMarker.length; i++) {
        var nameofMarkerColor = colorMarker[i];
        $('#markercolor').append($('<option>').text(nameofMarkerColor).attr('value', nameofMarkerColor));

    }
// ============================Marker Selection========================================================


var layerControl = false;
$.getJSON("/getJSONContent", function(data) {
    var baseLayer = data;

    for (var layer in baseLayer) {

        if (baseLayer.hasOwnProperty(layer)) {
            var dataLayer = baseLayer[layer];
            var randomColor = Math.floor((Math.random() * 10));
            var iconName = markerName[randomColor];
            var MarkerColor = colorMarker[randomColor];
            var Marker = L.AwesomeMarkers.icon({
                icon: iconName,
                markerColor: MarkerColor,
                prefix: 'fa'
            });
            var layerdata = L.Proj.geoJson(dataLayer, {
                pointToLayer: function(feature, latlng) {
                    var propertyObject = feature.properties;
                    var property = "";
                    for (var key in propertyObject) {
                        if (propertyObject.hasOwnProperty(key)) {
                            property += "<p><b>" + key + "</b>" + " : " + propertyObject[key] + "</p>";
                        }
                    }
                    // console.log(feature.properties.Name);

                    return L.marker(latlng, {
                        icon: Marker
                    }).bindPopup(property);
                }
            }).addTo(map);
            if (layerControl === false) {
                layerControl = L.control.layers().addTo(map);
            }
            layerControl.addOverlay(layerdata, layer);

        }


    }


});

function getLayer(name, data) {
    object.name = data;
    return object;
}
$('#convert').submit(function(e) {
    var file = $("#upload")[0].files[0];

    var layerName = file.name;

    e.preventDefault();
    $(this).ajaxSubmit({
        // console.log("submit");
        success: function(data, textStatus, jqXHR) {
            var layer = {
                    "name": layerName,
                    "datamain": data
                }
                // layer.data = data
            var dataSend = JSON.stringify(layer);
            // console.log(dataSend);
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: dataSend,
                contentType: 'application/json',

                success: function(data) {
                    console.log('success');
                    location.reload();
                }
            });
        }

    })

});

$('#changeMarkerForm').submit(function() {
    // Get all the forms elements and their values in one step
    event.preventDefault();
    var values = $(this).serialize();
    var MarkerSelection = parseFormValues(values);
    var nameofLayer = MarkerSelection.layerselection;
    var iconType = MarkerSelection.iconcolor;
    var holdercolor = MarkerSelection.holdercolor;
    var urlString = '/geojson/' + nameofLayer;
    $.getJSON(urlString, function(dataLayer) {
        var Marker = L.AwesomeMarkers.icon({
            icon: iconType,
            markerColor: holdercolor,
            prefix: 'fa'
        });
        var layerdata = L.Proj.geoJson(dataLayer, {
            pointToLayer: function(feature, latlng) {
                var propertyObject = feature.properties;
                var property = "";
                for (var key in propertyObject) {
                    if (propertyObject.hasOwnProperty(key)) {
                        property += "<p><b>" + key + "</b>" + " : " + propertyObject[key] + "</p>";
                    }
                }
                // console.log(feature.properties.Name);

                return L.marker(latlng, {
                    icon: Marker
                }).bindPopup(property);
            }
        }).addTo(map);

        if (layerControl === false) {
            layerControl = L.control.layers().addTo(map);
        }
        var nameDisplay = nameofLayer + "-Icon:" + iconType + "-Color:" + holdercolor;
        layerControl.addOverlay(layerdata, nameDisplay);
    })
});

function parseFormValues(values) {
    var data = values.split("&");
    // console.log(data);
    // console.log(data);
    var obj = {};
    for (var i = 0; i < data.length; i++) {
        var keyString = data[i];
        var keyValuesArray = keyString.split("=");
        var keyName = keyValuesArray[0];
        var keyValue = keyValuesArray[1];
        obj[keyName] = keyValue;
        // obj[data[key].split("=")[0]] = data[key].split("=")[1];
    }
    return obj;
}
// $.getJSON("/basemap/SingaporePools.geojson", function(data) {
//     L.Proj.geoJson(data).addTo(map);

// })
// "/basemap/SingaporePools.geojson"

displayMapSingaporePools("/basemap/SingaporePools.geojson", "SingaporePools")
    // displayMap("/basemap/DGPSubZone.geojson","SingaporePools")
var layerdata;
displayMapPolygon("/basemap/result.geojson", "Zone")

// /-------Display Propotional Map------------/
displayMapSingaporePoolsPropotion("/basemap/SingaporePools.geojson", "SingaporePools (Propotional)")

function displayMapSingaporePoolsPropotion(url, name) {
    $.getJSON(url, function(dataLayer) {
        var minmax = processData(dataLayer);
        // console.log(minmax);

        // var iconName = "dollar";
        // var MarkerColor = "red";
        // var Marker = L.AwesomeMarkers.icon({
        //     icon: iconName,
        //     markerColor: MarkerColor,
        //     prefix: 'fa'
        // });
        // var property = "";
        // layerdata = L.Proj.geoJson(dataLayer, {
        //     // onEachFeature: onEachFeaturePoints,
        //     pointToLayer: function(feature, latlng) {
        //         var propertyObject = feature.properties;
        //         var property = "";
        //         for (var key in propertyObject) {
        //             if (propertyObject.hasOwnProperty(key)) {
        //                 property += "<p><b>" + key + "</b>" + " : " + propertyObject[key] + "</p>";
        //             }
        //         }
        //         return L.circleMarker(latlng, {
        //             fillColor: "#708598",
        //             color: '#537898',
        //             weight: 1,
        //             fillOpacity: 0.6,
        //             radius: feature.properties.Gp1Gp2Winn

        //         }).bindPopup(property);

        //     }

        // }).addTo(map);
                // layerdata = L.Proj.geoJson(dataLayer).addTo(map);
                var dataInfo = processData(dataLayer);   
                createPropSymbols(dataInfo.timestamps, dataLayer);  
                createLegend(dataInfo.min,dataInfo.max);


    })

}

function processData(data) {

    var timestamps = [],
        min = Infinity,
        max = -Infinity;

    for (var feature in data.features) {

        var properties = data.features[feature].properties;

        for (var attribute in properties) {


            if (properties.Gp1Gp2Winn < min) {
                min = properties.Gp1Gp2Winn;
            }
            if (properties.Gp1Gp2Winn > max) {
                max = properties.Gp1Gp2Winn;
            }

        }
    }

    return {
        timestamps: timestamps,
        min: min,
        max: max
    }
} // end processData()
function createPropSymbols(timestamps, data) {

    cities = L.Proj.geoJson(data, {

        pointToLayer: function(feature, latlng) {

            return L.circleMarker(latlng, {

                fillColor: "#708598",
                color: '#537898',
                weight: 1,
                fillOpacity: 0.6

            });
        }
    }).addTo(map);
            if (layerControl === false) {
            layerControl = L.control.layers().addTo(map);
        }
        layerControl.addOverlay(cities, "Propotional Wins");

    updatePropSymbols(timestamps[0]);

} // end createPropSymbols()
function updatePropSymbols(timestamp) {

    cities.eachLayer(function(layer) {

        var props = layer.feature.properties,
            radius = calcPropRadius(props.Gp1Gp2Winn),
            popupContent = "<b>" + String(props.Gp1Gp2Winn) + " win</b><br>" +
            "<i>" + props.Name +
            "</i>";

        layer.setRadius(radius);
        layer.bindPopup(popupContent, {
            offset: new L.Point(0, -radius)
        });
        layer.on({

            mouseover: function(e) {
                this.openPopup();
                this.setStyle({
                    color: 'yellow'
                });
            },
            mouseout: function(e) {
                this.closePopup();
                this.setStyle({
                    color: '#537898'
                });

            }
        });

    });
} // end updatePropSymbols
function calcPropRadius(attributeValue) {

    var scaleFactor = 16, // value dependent upon particular data set
        area = attributeValue * scaleFactor;

    return Math.sqrt(area / Math.PI) * 2;

} // end calcPropRadius
function createLegend(min, max) {

    if (min < 10) {
        min = 10;
    }

    function roundNumber(inNumber) {

        return (Math.round(inNumber / 10) * 10);
    }

    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function(map) {

        var legendContainer = L.DomUtil.create("div", "legend"),
            symbolsContainer = L.DomUtil.create("div", "symbolsContainer"),
            classes = [roundNumber(min), roundNumber((max - min) / 2), roundNumber(max)],
            legendCircle,
            diameter,
            diameters = [];

        L.DomEvent.addListener(legendContainer, 'mousedown', function(e) {
            L.DomEvent.stopPropagation(e);
        });

        $(legendContainer).append("<h2 id='legendTitle'>Number of Wins</h2>");

        for (var i = 0; i < classes.length; i++) {

            legendCircle = L.DomUtil.create("div", "legendCircle");
            diameter = calcPropRadius(classes[i]) * 2;
            diameters.push(diameter);

            var lastdiameter;

            if (diameters[i - 1]) {
                lastdiameter = diameters[i - 1];
            } else {
                lastdiameter = 0;
            };
            $(legendCircle).attr("style", "width: " + diameter + "px; height: " + diameter +
                "px; margin-left: -" + ((diameter + lastdiameter + 2) / 2) + "px");


            $(legendCircle).append("<span class='legendValue'>" + classes[i] + "<span>");


            $(symbolsContainer).append(legendCircle);

        };

        $(legendContainer).append(symbolsContainer);

        return legendContainer;

    };

    legend.addTo(map);
} // end createLegend()
// /-------End Display Propotional Map------------/


    // /---------------Display Chrolopeth Map------------/
function displayMapSingaporePools(url, name) {
    $.getJSON(url, function(dataLayer) {

        var iconName = "dollar";
        var MarkerColor = "red";
        var Marker = L.AwesomeMarkers.icon({
            icon: iconName,
            markerColor: MarkerColor,
            prefix: 'fa'
        });
        var property = "";
        layerdata = L.Proj.geoJson(dataLayer, {
            // onEachFeature: onEachFeaturePoints,
            pointToLayer: function(feature, latlng) {
                var propertyObject = feature.properties;
                var property = "";
                for (var key in propertyObject) {
                    if (propertyObject.hasOwnProperty(key)) {
                        property += "<p><b>" + key + "</b>" + " : " + propertyObject[key] + "</p>";
                    }
                }
                return L.marker(latlng, {
                    icon: Marker
                }).bindPopup(property);

            }

        }).addTo(map);
        if (layerControl === false) {
            layerControl = L.control.layers().addTo(map);
        }
        layerControl.addOverlay(layerdata, name);
    })

}

function displayMapPolygon(url, name) {
    $.getJSON(url, function(dataLayer) {
        layerdata = L.Proj.geoJson(dataLayer, {
            onEachFeature: onEachFeature,
            style: style
        }).addTo(map);
        if (layerControl === false) {
            layerControl = L.control.layers().addTo(map);
        }
        layerControl.addOverlay(layerdata, name);
    })

}

function onEachFeaturePoints(feature, layer) {
    // does this feature have a property named popupContent?
    var property = "";
    var propertyObject = JSON.stringify(feature.properties);
    var object = JSON.parse(propertyObject);
    // console.log(propertyObject)
    for (var key in object) {
        // console.log(object[key]);
        if (object.hasOwnProperty(key)) {
            property += "<p><b>" + key + "</b>" + " : " + object[key] + "</p>";
        }
    }
    layer.bindPopup(property);
}
// var values = $('#changeMarkerForm').serialize();
// console.log(values);
// $.getJSON("basemap/SingaporePools.geojson", function(data) {
//      L.Proj.geoJson(data, {

//                 pointToLayer: function(feature, latlng) {
//                     // var name = feature.properties.Name;
//                     // console.log(feature.properties.Gp1Gp2Winn);
//                     return L.marker(latlng, {
//                         // radius: feature.properties.Gp1Gp2Winn
//                         icon: redMarker
//                     })
//                 }
//             }).addTo(map);

// })
// $.getJSON("basemap/DGPSubZone.geojson", function(data) {
//      console.log(data)
//      L.Proj.geoJson(data).addTo(map);

// })
function getColor(d) {
    return d > 30 ? '#800026' :
        d > 25 ? '#BD0026' :
        d > 20 ? '#E31A1C' :
        d > 15 ? '#FC4E2A' :
        d > 10 ? '#FD8D3C' :
        d > 5 ? '#FEB24C' :
        d > 0 ? '#FED976' :
        '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.AveragedWins),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var legend = L.control({
    position: 'bottomright'
});

legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 5, 10, 15, 20, 25, 30, 35],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

// add interaction
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);

}

function resetHighlight(e) {
    layerdata.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props) {

    var value = props ? props.AveragedWins : null;
    // console.log(value);
    if (value === null) {
        this._div.innerHTML = '<h4>Average Gp1&Gp2 Wins</h4>' + (props ?
            '<b> Zone:</b>' + props.DGPZ_NAME + '<br />' + '<b> SubZone:</b>' + props.DGPSZ_NAME + '<br />' + "0" + ' win' : 'Hover over a zone');
    } else {
        this._div.innerHTML = '<h4>Average Gp1&Gp2 Wins</h4>' + (props ?
            '<b> Zone:</b>' + props.DGPZ_NAME + '<br />' + '<b> SubZone:</b>' + props.DGPSZ_NAME + '<br />' + props.AveragedWins + ' win' : 'Hover over a zone');
    }

};

info.addTo(map);
// /-------------End Display Chrolopeth Map----------------/

