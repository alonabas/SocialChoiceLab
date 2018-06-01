var path = require('path');
var fs = require("fs");
var intersect = require('@turf/intersect');
var turf = require('@turf/turf');
var turf1 = require('@turf/centroid');
var polygon = require('turf-polygon');
var helper = require('@turf/helpers');
var topojsonClient = require('topojson-client');
var topojsonServer = require('topojson-server');
function calculateNeighboursBasic(geoJsonData, fullOutputFile, dataOutputFile){
	var count = 0
	// console.log(geoJsonData.features.length)
    for (var i = 0; i < geoJsonData.features.length; i++){
		// let featureI = geoJsonData.features[i];
		// if (featureI.geometry.type === 'MultiPolygon') {
		// 	featureI = helper.multiPolygon(featureI.geometry.coordinates);
		// 	// featureI = turf.flatten(featureI);
		// }
		// else featureI = helper.polygon(featureI.geometry.coordinates);
		let featureI = helper.feature(geoJsonData.features[i].geometry)
		for (var j = parseInt(i)+1; j< geoJsonData.features.length; j++){
			let featureJ = helper.feature(geoJsonData.features[j].geometry);
			// if (featureJ.geometry.type === 'MultiPolygon') {
			// 	featureJ = helper.multiPolygon(featureJ.geometry.coordinates);
			// 	// featureJ = turf.flatten(featureJ);
			// }
			// else featureJ = helper.polygon(featureJ.geometry.coordinates);
	
			// let featureJ = helper.feature(geoJsonData.features[j])
			// let featureJ = helper.multiPolygon(geoJsonData.features[j].geometry.coordinates);
			var intersection = turf.intersect(featureI.geometry, featureJ.geometry)
			console.log(i +', '+j+', '+intersection)
			// console.log(intersection)
			if (intersection){
				if (!geoJsonData.features[i].properties.neighbours){
					geoJsonData.features[i].properties.neighbours = []
				}
				if (geoJsonData.features[i].properties.neighbours.indexOf(j) > -1){
					console.log('Feature '+i +' and '+j+' are neighbours.');
					geoJsonData.features[i].properties.neighbours.push(j)
				}
				if (!geoJsonData.features[j].properties.neighbours){
					geoJsonData.features[j].properties.neighbours = []
				}
				if (geoJsonData.features[j].properties.neighbours.indexOf(i) > -1){
					geoJsonData.features[j].properties.neighbours.push(i)
				}
			}
		}
		geoJsonData.features[i].center = turf1(geoJsonData.features[i].geometry).geometry;
		// var geoJsonDataStr = JSON.stringify(geoJsonData);
		// fs.writeFile(fullOutputFile, geoJsonDataStr, function(err) {
		// 	if(err) {
		// 		return console.log(err);
		// 	}
		// });
		geoJsonData.features[i].geometry = {}
		
	}
	// console.log('finish find neighbours')
	// console.log(geoJsonData.features[0])
	var data = JSON.stringify(geoJsonData);
        fs.writeFile(dataOutputFile, data, function(err) {
			if(err) {
				return console.log(err);
			}
		});
    return geoJsonData;
}

function is2D(elem){
	if (Array.isArray(elem) && elem.length > 0){
		if (Array.isArray(elem[0]) && elem[0].length > 0){
			if (Array.isArray(elem[0][0]) && elem[0].length > 0){
				return !Array.isArray(elem[0][0][0])
			}
		}
	}
	return false
}

function isIntersects(featureI, featureJ){
	if (is2D(featureI), is2D(featureJ)){
		return turf.intersect(helper.polygon(featureI), helper.polygon(featureJ))
	}

	if (!is2D(featureI)){
		for(let pol in featureI){
			// console.log(featureI.length)
			let polFeature = featureI[pol]
			// console.log(polFeature)
			return isIntersects(polFeature, featureJ)
		}
	}
	if (!is2D(featureJ)){
		for(let pol in featureJ){
			let polFeature = featureJ[pol]
			return isIntersects(featureI, polFeature)
		}

	}
}

function calculateNeighboursRecursive (geoJsonData, fullOutputFile, dataOutputFile){
	for (var i = 0; i < geoJsonData.features.length; i++){
		let featureI = geoJsonData.features[i].geometry.coordinates;
		for (var j = parseInt(i)+1; j< geoJsonData.features.length; j++){
			let featureJ = geoJsonData.features[j].geometry.coordinates;
			let intersection = isIntersects(featureI, featureJ);
			// var intersection = turf(featureI, featureJ)
			// console.log(i +', '+j+', '+intersection)
			// console.log(intersection)
			if (intersection){
				console.log('Feature '+i +' and '+j+' are neighbours.');
				if (!geoJsonData.features[i].properties.neighbours){
					geoJsonData.features[i].properties.neighbours = []
				}
				if (geoJsonData.features[i].properties.neighbours.indexOf(j) > -1){
					
					geoJsonData.features[i].properties.neighbours.push(j)
				}
				if (!geoJsonData.features[j].properties.neighbours){
					geoJsonData.features[j].properties.neighbours = []
				}
				if (geoJsonData.features[j].properties.neighbours.indexOf(i) > -1){
					geoJsonData.features[j].properties.neighbours.push(i)
				}
			}
			break
		}
		geoJsonData.features[i].center = turf1(geoJsonData.features[i].geometry).geometry;
		// var geoJsonDataStr = JSON.stringify(geoJsonData);
		// fs.writeFile(fullOutputFile, geoJsonDataStr, function(err) {
		// 	if(err) {
		// 		return console.log(err);
		// 	}
		// });
		geoJsonData.features[i].geometry = {}
		
	}
	// console.log('finish find neighbours')
	// console.log(geoJsonData.features[0])
	var data = JSON.stringify(geoJsonData);
        fs.writeFile(dataOutputFile, data, function(err) {
			if(err) {
				return console.log(err);
			}
		});
    return geoJsonData;
}

function withTopoJson(geoJsonData, fullOutputFile, dataOutputFile){
	var topology = topojsonServer.topology({foo: geoJsonData});
	var neighbours = topojsonClient.neighbors(topology.objects.foo.geometries)
	for (var i in neighbours){
		let neigh = neighbours[i];
		geoJsonData.features[i].properties.neighbours = neigh
	}
	var geoJsonDataStr = JSON.stringify(geoJsonData);
	fs.writeFile(fullOutputFile, geoJsonDataStr, function(err) {
		if(err) {
			return console.log(err);
		}
	});
	geoJsonData.features.map((entry)=>{
		entry.center = turf1(entry.geometry).geometry;
		entry.geometry = {}
		return entry
	})
	var data = JSON.stringify(geoJsonData);
        fs.writeFile(dataOutputFile, data, function(err) {
			if(err) {
				return console.log(err);
			}
		});
    return geoJsonData;
}

module.exports.calculateNeighbours = function(geoJsonData, fullOutputFile, dataOutputFile){
	// return calculateNeighboursBasic(geoJsonData, fullOutputFile, dataOutputFile)
	// return calculateNeighboursRecursive(geoJsonData, fullOutputFile, dataOutputFile)
	return withTopoJson(geoJsonData, fullOutputFile, dataOutputFile);
	var count = 0
	// console.log(geoJsonData.features.length)
    for (var i = 0; i < geoJsonData.features.length; i++){
		let featureI = geoJsonData.features[i];
		if (featureI.geometry.type === 'MultiPolygon'){
			// console.log(featureI.geometry.coordinates)
			for (var polygonI in featureI.geometry.coordinates){
				// console.log(polygonI)
				checkToOtherFeature(geoJsonData, i, featureI.geometry.coordinates[polygonI])
			}
		}
        else{
			checkToOtherFeature(geoJsonData, i, featureI.geometry.coordinates)
		}
		geoJsonData.features[i].center = turf1(geoJsonData.features[i].geometry).geometry;
		// var geoJsonDataStr = JSON.stringify(geoJsonData);
		// fs.writeFile(fullOutputFile, geoJsonDataStr, function(err) {
		// 	if(err) {
		// 		return console.log(err);
		// 	}
		// });
		geoJsonData.features[i].geometry = {}
		
	}
	// console.log('finish find neighbours')
	// console.log(geoJsonData.features[0])
	var data = JSON.stringify(geoJsonData);
        fs.writeFile(dataOutputFile, data, function(err) {
			if(err) {
				return console.log(err);
			}
		});
    return geoJsonData;
}

function checkToOtherFeature(geoJsonData, i, polygonI){
	for (var j = parseInt(i)+1; j< geoJsonData.features.length; j++){
		let featureJ = geoJsonData.features[j];
		if (featureJ.geometry.type === 'MultiPolygon'){
			// console.log(featureJ.geometry.coordinates)
			for (var polygonJ in featureJ.geometry.coordinates){
				checkIntersection(polygonI, featureJ.geometry.coordinates[polygonJ], i, j, geoJsonData)
			}
		}
		else{
			checkIntersection(polygonI, featureJ.geometry.coordinates, i, j, geoJsonData)
		}
	}
}

function checkIntersection(polygonI, polygonJ, i, j, geoJsonData){
	// console.log(polygonI)
	// console.log(polygonJ)
	var intersection = turf.intersect(helper.polygon(polygonI), helper.polygon(polygonJ))
	console.log(i+','+j+':check intersection '+intersection)
	console.log(polygonJ)
	if (intersection){
		if (!geoJsonData.features[i].properties.neighbours){
			geoJsonData.features[i].properties.neighbours = []
		}
		if (geoJsonData.features[i].properties.neighbours.indexOf(j) > -1){
			console.log('Feature '+i +' and '+j+' are neighbours.');
			geoJsonData.features[i].properties.neighbours.push(j)
		}
		if (!geoJsonData.features[j].properties.neighbours){
			geoJsonData.features[j].properties.neighbours = []
		}
		if (geoJsonData.features[j].properties.neighbours.indexOf(i) > -1){
			geoJsonData.features[j].properties.neighbours.push(i)
		}
	}
}
