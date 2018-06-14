var path = require('path');
var fs = require('fs'),
	json;

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
	return filePath;
}


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
	console.log('Find neighbours...');
	var geo_json_path_neughbours = path.join(__dirname, (config.default_path + config.state + config.geo_json_path_neughbours))
	jsonData = neighbourFinder.calculateNeighbours(geoJson, geo_json_path_neughbours, jsonDataPath)
}
if (config.is_partition_ready === false) {
	console.log('Build new partition...');
	var fileName = getFileNameForPartitions();
	newJson = alg.greedyAlgorithm(JSON.parse(JSON.stringify(jsonData)), fileName,logPath);
}

console.log('Finish');