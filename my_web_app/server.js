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

console.log(config.is_ready)
if (config.is_ready){
  json = helper.readJsonFileSync(path.join(__dirname, config.ready_data_path), 'utf8')
}
else{
  json = helper.buildJsonFile(config.default_path,config.state, config.ready_data_path, config.is_geo)
}

var geoJson = helper.readJsonFileSync(path.join(__dirname, config.default_path+config.state + '/geo.json'), 'utf8')

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

console.log('starting') 
app.listen(3000);