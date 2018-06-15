var express = require('express');
var pug = require('pug');
var path = require('path');
var fs = require("fs");

var app = express();
var config = require('./config/default');

var helper = require('./util/helper');

var logPath = path.join(__dirname, config.default_path + config.state + config.ready_partition_path + config.log_path)

var geoJsonPath = path.join(__dirname, (config.default_path + config.state + config.geo_json_path))
var geoJson = helper.readJsonFileSync(geoJsonPath, 'utf8');

var jsonDataPath = path.join(__dirname, (config.default_path + config.state + config.data_json_path))
var oldJsonData = helper.readJsonFileSync(jsonDataPath, 'utf8')
oldJsonData.features.map(function (entry) {
	entry.geometry = {}
});

var fileName = path.join(__dirname, config.default_path + config.state + config.ready_partition_path + config.ready_partition_name + config.partition_file_to_use + '.json')
newJson = helper.readJsonFileSync(fileName, 'utf8')

helper.fixDistricts(oldJsonData);
helper.fixDistricts(geoJson);


let logJson = helper.readJsonFileSync(logPath)
var folderReadyPath = path.join(__dirname, config.default_path + config.state + config.ready_partition_path)


app.use('/', express.static(__dirname + '/dist'))
app.use('/node_modules', express.static(__dirname + '/node_modules'))
app.get('/', function (req, res) {
	res.sendFile(path.resolve('src', 'index.html'))
});

app.get('/getJson', function (req, res) {
	var id = req.query.id;
	var result = { old: oldJsonData, title: config.state + ' 2016 Elections' };
	if (typeof id !== 'undefined') {
		let newJson = helper.readJsonFileSync(path.join(__dirname, (config.default_path + config.state + config.ready_partition_path)) + '/result' + id + '.json', 'utf8')
		result = { new_json: newJson };
	}
	res.send(JSON.stringify(result));
});

app.get('/getGeoJson', function (req, res) {
	res.send(JSON.stringify(geoJson));
});

app.get('/getGeoJsonRep', function (req, res) {
	var repFeatures = geoJson.features.filter(function (entry) {
		if (!entry.properties.rep) return false;
		else if (!entry.properties.dem) return true;
		return entry.properties.rep.votes > entry.properties.dem.votes
	})
	res.send(JSON.stringify({ type: 'FeatureCollection', 'features': repFeatures }));
});

app.get('/getGeoJsonDem', function (req, res) {
	var demFeatures = geoJson.features.filter(function (entry) {
		if (!entry.properties.dem) return false;
		else if (!entry.properties.rep) return true;
		return entry.properties.dem.votes >= entry.properties.rep.votes
	})
	res.send(JSON.stringify({ type: 'FeatureCollection', 'features': demFeatures }));
});

app.get('/getGeoJsonDistrict', function (req, res) {
	var id = req.query.district
	var resultId = req.query.resultId;
	var type = req.query.type;
	if (type == 'new' && resultId != -1) {
		var geoJsonTemp = JSON.parse(JSON.stringify(geoJson))
		let jsonToUse = helper.readJsonFileSync(path.join(__dirname, (config.default_path + config.state + config.ready_partition_path)) + '/result' + resultId + '.json', 'utf8')
		geoJsonTemp.features.map(function (entry, index) {
			entry.properties.uscong_dis = jsonToUse.features[index].properties.uscong_dis
			return entry;
		})
	}
	else {
		var geoJsonTemp = JSON.parse(JSON.stringify(geoJson))
	}
	var distFeatures = geoJsonTemp.features.filter(function (entry) {
		return entry.properties.uscong_dis == id;
	})
	res.send(JSON.stringify({ type: 'FeatureCollection', 'features': distFeatures }));
});

app.get('/getListOfResults', function (req, res) {
	res.send(JSON.stringify(logJson))
})

let port = config.port;
console.log('Starting server, open browser on http://localhost:'+port)
app.listen(port);