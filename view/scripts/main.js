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

var redMarker = L.AwesomeMarkers.icon({
    icon: 'sitemap',
    markerColor: 'blue',
    prefix: 'fa'
});

proj4.defs("EPSG:3414", "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");
console.log("app start");
$.get("/getAllLayer", function(data) {
    

    var names = data;
    console.log(names);
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        console.log("start to get all layers");
        var urlString = '/geojson/' + name;
        $.getJSON(urlString, function(dataLoop) {
            console.log(dataLoop);
            L.Proj.geoJson(dataLoop, {

                pointToLayer: function(feature, latlng) {
                    // var name = feature.properties.Name;
                    // console.log(feature.properties.Name);
                    return L.marker(latlng, {
                        icon: redMarker
                    })
                }
            }).addTo(map);

        });
    }
})

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
