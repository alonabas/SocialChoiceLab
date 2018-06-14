var util = require('./DataStructureOps');
var DistrictObj = require('./District');
var fs = require("fs");
var util = require('./DataStructureOps');
var DistrictObj = require('./District');
var factory = require('../util/Factory');


var prob = factory.prob();
var desiredCandidate = factory.desiredCandidate();
var numberOfDistrictsToWin = factory.numberOfDistrictsToWin();
var stepsBeforeNormalization = factory.stepsBeforeNormalization();
var isToRecalculateWinner = factory.isToRecalculateWinner();
var gap = factory.winningGap();
var isAssignInitial = false;
var maximalNumberOfSteps = factory.maximalNumberOfSteps();
var initialAssignmentStrategyCount =factory.initialAssignmentStrategyCount();
var metricReq = factory.metric();
var winningAssignmentStrategyReq = factory.winningAssignmentStrategy()
var districSelectorStrategyReq = factory.districtSelector();
var districNormalizerStrategyReq = factory.districtNormalizer();
var initialAssignmentStrategyReq = factory.initialAssignmentStrategy();
var precinctSelectorReq = factory.precintSelector()
var winnerConsideration = factory.winnerConsideration();

var districtNormalizerGap = factory.districtNormalizerGap();

var testMetricReq = require('./TestMetric')
testMetric = new testMetricReq.TestMetric(metricReq);
testMetric.execute();

var metricToUse = new metricReq.Metric(gap, desiredCandidate);
var winnerAssignmentStrategy = new winningAssignmentStrategyReq.InitialDistrictAssignment(metricToUse, numberOfDistrictsToWin);
var districSelectorStrategy = new districSelectorStrategyReq.DistrictSelector(metricToUse, prob, gap);
var districNormalizerStrategy;
if (districNormalizerStrategyReq)
	districNormalizerStrategy = new districNormalizerStrategyReq.DistrictNormalizer(prob, districtNormalizerGap);
var initialAssignmentStrategy = new initialAssignmentStrategyReq.InitialAssignmentStrategy(prob, initialAssignmentStrategyCount);
var precinctSelector = new precinctSelectorReq.PrecinctSelector(desiredCandidate, prob, metricToUse);

var existingDistrictPrecinctSelectorReq = require('./PrecinctSelector/BestPrecinctInExistingDistrict');
var existingDistrictPrecinctSelector = new existingDistrictPrecinctSelectorReq.PrecinctSelector(desiredCandidate, prob, metricToUse)


function initDistricts(data, winnerConsideration){
	util.applyEmptyDistrictToData(data);
	var districts = util.createDistrictsArray(data, gap, isAssignInitial, desiredCandidate, winnerConsideration);
	winnerAssignmentStrategy.assignWinners(districts, desiredCandidate, data, metricToUse.metricDistrict, numberOfDistrictsToWin)
	initialPrecinctsAssignment(districts, data);
	// util.printDistricts(districts,data);
	return districts;
}

function initialPrecinctsAssignment(districts, data){
	console.log('Initial district assignment')
	var blocked = false;
	var i = 0;
	do{
		districts.forEach(function(district){
			var precinct = existingDistrictPrecinctSelector.select(district, district.potentialPrecinctsToAdd, data, 0);
			// district.potentialPrecinctsToAdd.sort((entry1, entry2) =>{
			// 	let p1 = data[entry1].properties.dem.votes - data[entry1].properties.rep.votes
			// 	let p2 = data[entry2].properties.dem.votes - data[entry2].properties.rep.votes
			// 	return p1-p2
			// })
			// console.log(district.potentialPrecinctsToAdd[0])
			// console.log(district.potentialPrecinctsToAdd[district.potentialPrecinctsToAdd.length-1])
			// console.log('District '+district.name+' precinct: '+precinct+ ',s.t '+data[precinct].properties.all.rep.votes+', '+data[precinct].properties.all.dem.votes)
			if (!precinct) {
				blocked = true;
			}
			
		 	else district.addPrecinct(precinct, data)
		 });
		 i++;
		//  console.log(initialAssignmentStrategy.isStop(districts, i, desiredCandidate))
		//  console.log(!initialAssignmentStrategy.isStop(districts, i, desiredCandidate)&& !blocked)
	} while(!initialAssignmentStrategy.isStop(districts, i, desiredCandidate) && !blocked);
	util.printDistricts(districts,data);
}

function assignPrecincts(districts, data){
	console.log('Start: assign precincts')
	// util.printDistricts(districts,data);
	var finished = util.isAllAssigned(data);
	while(!finished){
		var districtToAdd = districSelectorStrategy.select(districts, desiredCandidate);
		if (districtToAdd.potentialPrecinctsToAdd.length == 0){
			util.solveStuck(districtToAdd, data, districts);
		}
		var precinctToAdd = precinctSelector.select(districtToAdd, districtToAdd.potentialPrecinctsToAdd, data);
		if (typeof precinctToAdd !== "undefined") districtToAdd.addPrecinct(precinctToAdd, data)
		finished = util.isAllAssigned(data)
		// printMissing(data, districts)
		
	}
	util.printDistricts(districts,data);
}

function greedyAlgorithm(json, filename, logFile){
	var data = JSON.parse(JSON.stringify(json.features));
	var partititonFound = false;
	var i = 0;
	data = util.fixDistrict(data)
	while (!partititonFound && i <= maximalNumberOfSteps){
		var districts = initDistricts(data, winnerConsideration)
		assignPrecincts(districts, data)
		var changedPrecincts = util.calculateChangedPrecincts(data)    
		let winners = util.getWinners(districts).length;

		console.log('Number of changed precincts: '+changedPrecincts.length+' and winners: '+winners)
		if (winners >= numberOfDistrictsToWin && (!districNormalizerStrategy || districNormalizerStrategy.isNormalized(districts, data))){
			console.log('Partition is legal')
			if (util.isPartitionLegal(districts, 0)){
				json.features = data;
				console.log('DONEEE')
				partititonFound = true;
				// return;
				util.saveAssignment(json, filename)
				util.saveToLog(logFile, factory.discription(), districts);
			}
		}
		util.printDistricts(districts,data);
		// return
		i++;
	}
	return partititonFound;
	
}

function printMissing(data, districts){
    var missing = data.filter(function(entry){
        return entry.properties.new_district == 'None';
    })
	console.log('Missing partition for '+missing.length)
	let isZero = true
	districts.forEach(function(entry){
		if (entry.potentialPrecinctsToAdd.length > 0) isZero = false;
		console.log('Potential in district '+entry.name+': '+entry.potentialPrecinctsToAdd.length);
	})
	if (isZero){
		console.log('Unassigned precincts')
		missing.forEach(function(entry){
			console.log(entry.properties)

		})
	}
}


module.exports.greedyAlgorithm = greedyAlgorithm