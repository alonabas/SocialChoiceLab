var express = require('express');
var pug = require('pug');
var path = require('path');
var fs = require("fs"),
   json;

var app = express();
var config = require('./config/default');

var helper = require('./util/helper');
app.set('views', './views');
app.set('view engine', 'pug');

var geoJson
if (config.is_ready){
  json = helper.readJsonFileSync(path.join(__dirname, config.ready_data_path), 'utf8')
}
else{
  json = helper.buildJsonFile(config.default_path,config.state, config.ready_data_path, config.ready_geodata_path)
}

geoJson = helper.readJsonFileSync(path.join(__dirname, config.ready_geodata_path), 'utf8')

app.use('/public', express.static(__dirname + '/public'))
app.use('/node_modules', express.static(__dirname + '/node_modules'))
app.get('/', function(req, res) {
  res.render('home.pug', {
    title: 'Welcome',
    state: config.state
  });
});

app.get('/getJson', function(req, res) {
  res.send(JSON.stringify(json));
});

app.get('/getGeoJson', function(req, res) {
  res.send(JSON.stringify(geoJson));  
});

app.get('/getGeoJsonRep', function(req, res) {
  var repFeatures = geoJson.features.filter(function(entry){
    if (!entry.properties.rep) return false;
    else if (!entry.properties.dem) return true;
    return entry.properties.rep.votes > entry.properties.dem.votes
  })
  res.send(JSON.stringify({type:'FeatureCollection', 'features':repFeatures}));  
});

app.get('/getGeoJsonDem', function(req, res) {
  var demFeatures = geoJson.features.filter(function(entry){
    if (!entry.properties.dem) return false;
    else if (!entry.properties.rep) return true;
    return entry.properties.dem.votes >= entry.properties.rep.votes
  })
  res.send(JSON.stringify({type:'FeatureCollection', 'features':demFeatures}));
});

app.get('/getGeoJsonDistrict', function(req, res) {
  var id = partInt(req.params['district'])
  var distFeatures = geoJson.features.filter(function(entry){
    entry.properties.district == id;
  })
  res.send(JSON.stringify({type:'FeatureCollection', 'features':distFeatures}));
});

console.log('starting') 
app.listen(3000);