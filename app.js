var express = require("express");
var http = require("http");
var app = express();
var request = require('request');
var ogr2ogr = require('ogr2ogr');
var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require('multer');
var busboy = require('connect-busboy');
var turf = require('turf');
// var gdal = require("gdal");
var _ = require('lodash');
var mapshaper = require('mapshaper');
var globalurl = __dirname + "/view";
var path = require('path');
var proj4 = require('proj4')
proj4.defs("EPSG:3414", "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");

app.use(express.static(__dirname + "/view"));
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var directory = path.join(__dirname, 'view/uploads');

        cb(null, directory)
    },
    onError: function(err, next) {
        console.log('error', err);
        next(err);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});


var upload = multer({
    storage: storage
});
app.use(busboy());


//Store all HTML files in view folder.

app.get('/', function(req, res) {
    res.sendFile((path.join(__dirname + '/index.html')));

    //It will find and locate index.html from View or Scripts
});
// app.get('/UserGuide', function(req, res) {
//     res.sendFile((path.join(__dirname + '/UserGuide.html')));

//     //It will find and locate index.html from View or Scripts
// });


var SPdir = globalurl + "/basemap/SingaporePools.geojson"; //get Singapore Pool Data
var SingaporePools = JSON.parse(fs.readFileSync(SPdir, "utf8")); //ParseJSON
var SubzoneDir = globalurl + "/basemap/DGPSubZone.geojson"; //Get Subzone Data
var SubZone = JSON.parse(fs.readFileSync(SubzoneDir, "utf8")); //Parse JSON

var averaged = turf.average(
    SubZone, SingaporePools, 'Gp1Gp2Winn', 'AveragedWins'); //using turf to process data
var file = globalurl + '/basemap/result.geojson';
fs.writeFile(globalurl + "/basemap/result.geojson", JSON.stringify(averaged), function(err) {
        if (err) {
            return console.log(err);
        }
    }) //return result and put in basemap folder

// var resultFeatures = SingaporePools.features.concat(
//   averaged.features);
// var resultFeatures = SingaporePools.features.concat(
//   averaged.features);

// var result = {
//    //  "type": "FeatureCollection",
//    //  "crs":{  
//    //    "type":"name",
//    //    "properties":{  
//    //       "name":"urn:ogc:def:crs:EPSG::3414"
//    //    }
//    // },
//     "features": averaged
// };


// make directory
var dirForGeojson = __dirname + '/view/geojson';
var dirForUploadsFiles = __dirname + '/view/uploads';


if (!fs.existsSync(dirForGeojson)) {
    fs.mkdirSync(dirForGeojson);
}
if (!fs.existsSync(dirForUploadsFiles)) {
    fs.mkdirSync(dirForUploadsFiles);
}


// var UploadsData =JSON.parse(fs.readFile(__dirname + "/view/uploads/" + "AQUATICS.kml", "utf8"));;

// get the name for file
function getSecondPart(str) {
    return str.split('.')[1];
}

function getFirstPart(str) {
    return str.split('.')[0];
}


app.post('/upload', function(req, res) {
    var jsonString = '';

    req.on('data', function(data) {
        jsonString += data;
    });

    req.on('end', function() {
        var JSONReturn = JSON.parse(jsonString);
        // console.log(JSONReturn.datamain);
        var objectWrite = JSONReturn.datamain;
        var nameofFile = JSONReturn.name;
        // var beautyJSON = JSON.parse(objectWrite);
        //         for (var key in p) {
        //   if (p.hasOwnProperty(key)) {
        //     alert(key + " -> " + p[key]);
        //   }
        // }

        var features = objectWrite.features;
        for (var i = 0 ; i < features.length; i++){
            var oldCor = features[i].geometry.coordinates;
            var newCoor = proj4(proj4("EPSG:3414")).inverse(oldCor);
            objectWrite.features[i].geometry.coordinates = newCoor;
        }
        var beautyJSON = JSON.stringify(objectWrite);
        console.log(beautyJSON);

        // for (var key in features) {
        //     console.log(features.geometry);
        // }

        var nameFirstPart = getFirstPart(nameofFile);
        var urlDestination = globalurl + "/geojson/" + nameFirstPart + ".geojson";
        fs.writeFile(urlDestination, beautyJSON, function(err) {
            if (err) {
                return console.log(err);
            }
        });
        res.redirect("back");

    })



});
// Remove all files in uploads
function rmDir(dirPath) {
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        return;
    }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
        // fs.rmdirSync(dirPath);
};

app.get("/removeUploadsFiles", function(req, res) {
    var URLremove = path.join(__dirname, 'view/uploads/');
    rmDir(URLremove);
    res.send("Remove successful");
})
app.get("/removeGeojsonLayer", function(req, res) {
        var URLremove = path.join(__dirname, 'view/geojson/');
        rmDir(URLremove);
        res.send("Remove successful");
    })
    // var dir =  __dirname + '/view' + '/geojson' ;
    // var source = JSON.parse(require(dir + '/SingaporePools1.geojson'));
    // fs.readFile(__dirname + "/view/geojson/" + "DGPSubZone.json", "utf8", function(err, data) {
    // var reproject = require("reproject");
    // fs.readFile(dir + '/SingaporePools1.geojson', "utf8", function(err, data) {
    //     var source = JSON.parse(data);
    //     console.log(source);
    //     reproject(source, proj4.WGS84, crss);


// })

// convert shapefile to geojson
function convert(file, name) {

    console.log("file content: " + file);
    var nameofFile = name + '.geojson';
    var urlDestination = path.join(__dirname, 'view/geojson', nameofFile)
    var FILE = ogr2ogr(file)
        .format('GeoJSON')
        .skipfailures()
        .project("EPSG:3414")
        .stream()
        // fs.writeFile(urlDestination,FILE);
    FILE.pipe(fs.createWriteStream(urlDestination));

}

// var dir = __dirname + '/view' + '/geojson/' +"SingaporePools1.geojson";
// // console.log(dir);
// var dataset = gdal.open(dir);
// var layer = dataset.layers.get(0);
//  layer.srs.toProj4();
//  console.log(layer);
// fs.createWriteStream(globalurl + '/geojson/' +dataset)


//end file upload

//read all files in a folder //
app.get('/getAllLayer', function(req, res) {
    // path.join(__dirname, 'view/geojson')

    var directory = path.join(__dirname, 'view/geojson');
    var name = fs.readdirSync(directory);

    res.send(name);
});


app.get('/getJSONContent', function(req, res) {
    // path.join(__dirname, 'view/geojson')
    // var SingaporePools = JSON.parse(fs.readFileSync(SPdir, "utf8"));
    var directory = path.join(__dirname, 'view/geojson');
    var names = fs.readdirSync(directory);
    var ArraySend;
    var objectSend = {};
    for (var i = 1; i < names.length; i++) {
        var name = names[i];
        var dir = path.join(__dirname, "view", "geojson", name);
        // console.log(dir);

        var fileJSON = JSON.parse(fs.readFileSync(dir, "utf8"));
        objectSend[name] = fileJSON;

    }
    res.send(objectSend);

});
app.get('/getUploadFiles', function(req, res) {
    // path.join(__dirname, 'view/geojson')
    // var SingaporePools = JSON.parse(fs.readFileSync(SPdir, "utf8"));
    var directory = path.join(__dirname, 'view/uploads');
    var names = fs.readdirSync(directory);
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        if (name === ".DS_Store") {
            break;
        }
        var dir = path.join(directory, name);
        // console.log(dir);

        // var fileUploads = fs.readFileSync(dir, "utf8");
        // console.log(fileUploads);
        // res.send(fileUploads);
        var nameFirstPark = getFirstPart(name);
        convert(dir, nameFirstPark);

    }
    res.send("Ok");

});

// end read all files from folder 
app.get('/getUploadFilesName', function(req, res) {
    // path.join(__dirname, 'view/geojson')
    // var SingaporePools = JSON.parse(fs.readFileSync(SPdir, "utf8"));
    var directory = path.join(__dirname, 'view/uploads');
    var names = fs.readdirSync(directory);
    res.send(names);



});

app.get('/getPostalCode/:id', function(req, res) {
    var postcode = req.params.id;
    // console.log("id " + postcode);
    var urlString = "http://www.onemap.sg/APIV2/services.svc/basicSearchV2?token=qo/s2TnSUmfLz+32CvLC4RMVkzEFYjxqyti1KhByvEacEdMWBpCuSSQ+IFRT84QjGPBCuz/cBom8PfSm3GjEsGc8PkdEEOEr&searchVal=" + postcode + "&otptFlds=SEARCHVAL,CATEGORY&returnGeom=1&rset=1&projSys=WGS84";
    request(urlString, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            var X = data.SearchResults[1].X; //Get X, and Y coordinate
            var Y = data.SearchResults[1].Y;
            var coordinates = [];
            coordinates.push(parseFloat(X));
            coordinates.push(parseFloat(Y));
            var currentPoint = {
                "type": "Feature",
                "properties": {},

                "geometry": {
                    "type": "Point",
                    "coordinates": coordinates
                }
            };
            // var currentPointJSON = JSON.parse(currentPoint);
            var buffer = turf.buffer(currentPoint, 1, 'kilometers');

            buffer.features[0].properties = {
                "fill": "#6BC65F",
                "stroke": "#25561F",
                "stroke-width": 2
            };
            buffer.csr = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3414" } },
                // console.log(buffer);
            ptsWithin = turf.within(SingaporePools, buffer);

            // buffer.features.push(currentPoint);


            // var returnBuffer = JSON.parse(buffer);
            res.send(ptsWithin);



        }
    });
    // var coordinate = geoCoding(postcode);
    // console.log(coordinate);
})

function geoCoding(postcode) {
    var urlString = "http://www.onemap.sg/APIV2/services.svc/basicSearchV2?token=qo/s2TnSUmfLz+32CvLC4RMVkzEFYjxqyti1KhByvEacEdMWBpCuSSQ+IFRT84QjGPBCuz/cBom8PfSm3GjEsGc8PkdEEOEr&searchVal=" + postcode + "&otptFlds=SEARCHVAL,CATEGORY&returnGeom=1&rset=1&projSys=WGS84";

    request(urlString, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            var X = data.SearchResults[1].X; // Show the HTML for the Google homepage.
            var Y = data.SearchResults[1].Y;
            var coordinates = "['X': " + X + ",'Y' :" + Y + "]";


            return coordinates;
        }
    });

}

var postcodeQuery = geoCoding("560615");
// var json = {x:"1"}
// // console.log(json.x);
// JSON.parse(postcodeQuery);
// console.log(postcodeQuery);

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});



app.listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
