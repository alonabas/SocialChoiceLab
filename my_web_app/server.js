var express = require('express');
var pug = require('pug');
var path = require('path');
var fs = require("fs"),
	json;

var app = express();
var config = require('./config/default');

var helper = require('./util/helper');
var factory = require('./util/Factory');

var neighbourFinder = require('./util/NeighbourFinder');

var alg = factory.algorithm();

function printCounts(data) {
	var districts = data.map(function (entry) {
		return entry.district;
	}).filter(function (elem, index, self) {
		return self.indexOf(elem) == index;
	})
	districts.forEach(function (district) {
		var inDistrict = data.filter(function (element) {
			return element.district == district;
		});
		var votesInDistrict = inDistrict.map(function (entry) {
			return entry.votes || 0;
		}).reduce(function (e1, e2) {
			return e1 + e2;
		}, 0);
		console.log('District ' + district + ' has ' + votesInDistrict + ' votes and ' + inDistrict.length + ' districts')
	})
}
var logPath = path.join(__dirname, config.default_path + config.state + config.ready_partition_path + config.log_path)

function getFileNameForPartitions() {
	var prefix = config.ready_partition_name
	var found = false;
	var folderPath = path.join(__dirname, (config.default_path + config.state + config.ready_partition_path))
	if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
	var index = 0;
	var filePath;
	while (!found) {
		filePath = path.join(folderPath, config.ready_partition_name + index + '.json')
		let temp = fs.existsSync(filePath)
		if (temp) {
			index++;
		}
		else {
			found = true
		}
	}
	console.log(filePath)
	return filePath;
}


var jsonAfterAlg = json
var geoJsonPath = path.join(__dirname, (config.default_path + config.state + config.geo_json_path))
var geoJson = helper.readJsonFileSync(geoJsonPath, 'utf8');
var jsonDataPath = path.join(__dirname, (config.default_path + config.state + config.data_json_path))
var jsonData;
if (config.is_neighbours_ready) {
	jsonData = helper.readJsonFileSync(jsonDataPath, 'utf8')
	jsonData.features.map(function (entry) {
		entry.geometry = {}
	});
	
}
else {
	var geo_json_path_neughbours = path.join(__dirname, (config.default_path + config.state + config.geo_json_path_neughbours))
	jsonData = neighbourFinder.calculateNeighbours(geoJson, geo_json_path_neughbours, jsonDataPath)
	return;
}
if (config.is_partition_ready) {
	var fileName = path.join(__dirname, config.default_path + config.state + config.ready_partition_path + config.ready_partition_name + config.partition_file_to_use + '.json')
	newJson = helper.readJsonFileSync(fileName, 'utf8')
	
}
else {
	var fileName = getFileNameForPartitions();
	newJson = alg.greedyAlgorithm(JSON.parse(JSON.stringify(jsonData)), fileName,logPath);
	return;
}

// fix geojson
jsonData.features.map(function (entry) {
	let temp;
	if (Array.isArray(entry.properties.all) && entry.properties.all.length > 0) {
		temp = entry.properties.all[0].district
	}
	else {
		temp = entry.properties.all.district
	}
	if (temp) {
		entry.properties.uscong_dis = temp.toString();
	}
	else {
		console.log('No district for precinct ' + entry.properties.name);
		console.log(entry.properties.all)
		console.log(entry.properties.uscong_dis)

	}
	return temp
});

geoJson.features.map(function (entry) {
	let temp;
	if (Array.isArray(entry.properties.all) && entry.properties.all.length > 0) {
		temp = entry.properties.all[0].district
	}
	else {
		temp = entry.properties.all.district
	}
	if (temp) {
		entry.properties.uscong_dis = temp.toString();
	}
	else {
		console.log('No district for precinct ' + entry.properties.name);
		console.log(entry.properties.all)
		console.log(entry.properties.uscong_dis)
	}
	return temp
});

let logJson = helper.readJsonFileSync(logPath)
var folderReadyPath = path.join(__dirname, config.default_path + config.state + config.ready_partition_path)


app.use('/', express.static(__dirname + '/dist'))
app.use('/node_modules', express.static(__dirname + '/node_modules'))
app.get('/', function (req, res) {
	res.sendFile(path.resolve('src', 'index.html'))
});

app.get('/getJson', function (req, res) {
	var id = req.query.id;
	var result = { old: jsonData, title: config.state + ' 2016 Elections' };
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
	console.log(distFeatures.length)
	res.send(JSON.stringify({ type: 'FeatureCollection', 'features': distFeatures }));
});

app.get('/getListOfResults', function (req, res) {
	res.send(JSON.stringify(logJson))
})

// app.get('/getResult', function(req, res) {

// });


console.log('starting')
app.listen(3001);