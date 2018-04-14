var util = require('./DataStructureOps');
var DistrictObj = require('./District');
var fs = require("fs");
var util = require('./DataStructureOps');
var DistrictObj = require('./District');
var metrics = require('./SortMetrics');
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

var districtNormalizerGap = factory.districtNormalizerGap();

var testMetricReq = require('./TestMetric')
testMetric = new testMetricReq.TestMetric(metricReq);
testMetric.execute();

var metricToUse = new metricReq.Metric(gap, desiredCandidate);
var winnerAssignmentStrategy = new winningAssignmentStrategyReq.InitialDistrictAssignment(metricToUse, numberOfDistrictsToWin);
var districSelectorStrategy = new districSelectorStrategyReq.DistrictSelector(metricToUse, prob, gap);
var districNormalizerStrategy = new districNormalizerStrategyReq.DistrictNormalizer(prob, districtNormalizerGap);
var initialAssignmentStrategy = new initialAssignmentStrategyReq.InitialAssignmentStrategy(prob, initialAssignmentStrategyCount);
var precinctSelector = new precinctSelectorReq.PrecinctSelector(desiredCandidate, prob, metricToUse);

var existingDistrictPrecinctSelectorReq = require('./PrecinctSelector/BestPrecinctInExistingDistrict');
var existingDistrictPrecinctSelector = new existingDistrictPrecinctSelectorReq.PrecinctSelector(desiredCandidate, prob, metricToUse)


function initDistricts(data, desiredCandidate){
	util.applyEmptyDistrictToData(data);
	var districts = util.createDistrictsArray(data, gap, isAssignInitial, desiredCandidate);
	winnerAssignmentStrategy.assignWinners(districts, desiredCandidate, data, metricToUse.metricDistrict, numberOfDistrictsToWin)
	initialPrecinctsAssignment(districts, data);
	return districts;
}

function initialPrecinctsAssignment(districts, data){
	console.log('Initial district assignment')
	var blocked = false;
	var i = 0;
	do{
		districts.forEach(function(district){
			var precinct = existingDistrictPrecinctSelector.select(district, district.potentialPrecinctsToAdd, data);
			if (!precinct) {
				blocked = true;
			}
		 	else district.addPrecinct(precinct, data)
		 });
		 i++;
	} while(!initialAssignmentStrategy.isStop(districts, i, desiredCandidate) && !blocked);
	util.printDistricts(districts,data);
}

function assignPrecincts(districts, data){
	console.log('Start: assign precincts')
	util.printDistricts(districts,data);
	var finished = util.isAllAssigned(data);
	while(!finished){
		var districtToAdd = districSelectorStrategy.select(districts, desiredCandidate);
		var precinctToAdd = precinctSelector.select(districtToAdd, districtToAdd.potentialPrecinctsToAdd, data);
		if (typeof precinctToAdd !== "undefined") districtToAdd.addPrecinct(precinctToAdd, data)
		finished = util.isAllAssigned(data)
	}
	util.printDistricts(districts,data);
}

function greedyAlgorithm(json, desiredCandidate, filename){
	var data = JSON.parse(JSON.stringify(json.features));
	var partititonFound = false;
	var i = 0;
	data = util.fixDistrict(data)
	while (!partititonFound && i <= maximalNumberOfSteps){
		var districts = initDistricts(data, desiredCandidate)
		assignPrecincts(districts, data)
		var changedPrecincts = util.calculateChangedPrecincts(data)    
		console.log('Number of changed precincts: '+changedPrecincts.length)
		let winners = util.getWinners(districts).length;
		if (winners >= numberOfDistrictsToWin && districNormalizerStrategy.isNormalized(districts, data)){
			if (util.isPartitionLegal(districts)){
				json.features = data;
				console.log('DONEEE')
				partititonFound = true;
				// return;
				util.saveAssignment(json, filename)
				util.saveToLog(factory.logFile(), factory.discription(), districts);
			}
		}
		// return
		i++;
	}
	return partititonFound;
	
}

function printMissing(data){
    var missing = data.filter(function(entry){
        return entry.properties.new_district == 'None';
    })
    console.log('Missing partition for '+missing.length)
}


module.exports.greedyAlgorithm = greedyAlgorithm