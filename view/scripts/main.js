L.Icon.Default.imagePath = '/images';
L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
/* create leaflet map */
var map = L.map('map', {
    center: [1.35, 103.8],
    zoom: 12
});

// features = JSON.parse(feature);
// omnivore.geojson(features).addTo(map);

// $.getJSON('/geojson/PLAYSG.json', function(data) {
//     omnivore.geojson(data).addTo(map);
// })
new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 50,
    attribution: 'Map data © <a href="https://www.openstreetmap.org">OpenStreetMap contributors</a>'
}).addTo(map);
// omnivore.geojson('/geojson/PLAYSG.json').addTo(map);

// var Marker = L.AwesomeMarkers.icon({
//     icon: 'sitemap',
//     markerColor: 'blue',
//     prefix: 'fa'
// });
var colorMarker = ['red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpuple', 'cadetblue'];
var markerName = ["automobile", "bank", "bar-chart", "beer", "bell", "bed", "calendar", "cloud", "coffee", "comment"];
proj4.defs("EPSG:3414", "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");
// var controlLayers = L.control.layers().addTo(map);
$.get("/getAllLayer", function(data) {
    var names = data;
      for (var i = 1; i < names.length; i++) {
                var nameofLayer = names[i];
                 $('#layerselection').append($('<option>').text(nameofLayer).attr('value', nameofLayer));

      }

})

// $.get("/getAllLayer", function(data) {

//     var names = data;

//      // ('#layerselection').append($('<option>').text(value).attr('value', index));


//     for (var i = 1; i < names.length; i++) {

//         var nameofLayer = names[i];
//          $('#layerselection').append($('<option>').text(nameofLayer).attr('value', nameofLayer));


//         var urlString = '/geojson/' + nameofLayer;

//         // console.log("start here" + urlString);
//         // console.log(i);

//         $.getJSON(urlString, function(dataLoop) {
//             console.log(nameofLayer);
//             variable = dataLoop;
//             // display a random number between 1 and 10.
//         var randomColor = Math.floor((Math.random() * 10));

//             // console.log(i);
//              var iconName = markerName[randomColor];
//         var MarkerColor  =  colorMarker[randomColor];
//             var Marker = L.AwesomeMarkers.icon({
//                 icon:iconName,
//                 markerColor: MarkerColor,
//                 prefix: 'fa'
//             });
//             // var overlaymap ={}
//             // overlaymap[name] = "dataLoop";
//             // console.log(dataLoop);

//            var layer =  L.Proj.geoJson(dataLoop, {

//                 pointToLayer: function(feature, latlng) {
//                     // var name = feature.properties.Name;
//                     // console.log(feature.properties.Name);

//                     return L.marker(latlng, {
//                         icon: Marker
//                     })
//                 }
//             }).addTo(map);
//             controlLayers.addOverlay(layer, nameofLayer);

//             // var aLayer = L.Proj.geoJson(dataLoop);
//             //    console.log(aLayer);
//             //    aLayer.addTo(map);
//             // overlaymap[name].push(aLayer);

//         });
//     }

// })
var layerControl = false;
$.getJSON("getJSONContent", function(data) {
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
                    // var name = feature.properties.Name;
                    // console.log(feature.properties.Name);

                    return L.marker(latlng, {
                        icon: Marker
                    })
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
    var iconcolor  =MarkerSelection.iconcolor;
    var holdercolor = MarkerSelection.holdercolor;
    var urlString = '/geojson/' + nameofLayer;
     $.getJSON(urlString, function(dataLayer) {
        var Marker = L.AwesomeMarkers.icon({
                icon: iconcolor,
                markerColor: holdercolor,
                prefix: 'fa'
            });
            var layerdata = L.Proj.geoJson(dataLayer, {
                pointToLayer: function(feature, latlng) {
                    // var name = feature.properties.Name;
                    // console.log(feature.properties.Name);

                    return L.marker(latlng, {
                        icon: Marker
                    })
                }
            }).addTo(map);

        if (layerControl === false) {
                layerControl = L.control.layers().addTo(map);
            }
            layerControl.addOverlay(layerdata, nameofLayer);
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



$.getJSON("/basemap/result.geojson", function(data) {
    L.Proj.geoJson(data).addTo(map);

})
