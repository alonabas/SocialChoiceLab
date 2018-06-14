var fs = require('fs');
var center = require('@turf/centroid');
var topojsonClient = require('topojson-client');
var topojsonServer = require('topojson-server');


function withTopoJson(geoJsonData, fullOutputFile, dataOutputFile) {
	var topology = topojsonServer.topology({ foo: geoJsonData });
	var neighbours = topojsonClient.neighbors(topology.objects.foo.geometries)
	for (var i in neighbours) {
		let neigh = neighbours[i];
		geoJsonData.features[i].properties.neighbours = neigh
	}
	var geoJsonDataStr = JSON.stringify(geoJsonData);
	fs.writeFile(fullOutputFile, geoJsonDataStr, function (err) {
		if (err) {
			return console.log(err);
		}
	});
	geoJsonData.features.map((entry) => {
		entry.center = center(entry.geometry).geometry;
		entry.geometry = {}
		return entry
	})
	var data = JSON.stringify(geoJsonData);
	fs.writeFile(dataOutputFile, data, function (err) {
		if (err) {
			return console.log(err);
		}
	});
	return geoJsonData;
}

module.exports.calculateNeighbours = function (geoJsonData, fullOutputFile, dataOutputFile) {
	return withTopoJson(geoJsonData, fullOutputFile, dataOutputFile);

}
