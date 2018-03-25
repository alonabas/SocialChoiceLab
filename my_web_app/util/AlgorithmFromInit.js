var util = require('./DataStructureOps');
var DistrictObj = require('./District');
var fs = require("fs");
var prob = 0.9
var countOfSame = 200
var isAssignInitial = false;
var desiredCandidate = 0;
var maximalNumberOfSteps = 500;

var winningAssignmentStrategyReq = require('./WinningAssignmentStrategy/InititlaWinningAssignmentStrategy')
var winnerAssignmentStrategy = new winningAssignmentStrategyReq.InititlaWinningAssignmentStrategy();

var bestMetricReq = require('./Metric/DiffPrecinctMetric');
var metricToUse1 = new metricReq.Metric(gap, desiredCandidate);


var sameDistrictMetricReq = require('./Metric/ExistingDistrict');
var sameDistrictMetric = new sameDistrictMetricReq.Metric(gap, desiredCandidate);

// var bestInSameDistrictMetricReq = require('./Metric/BestPrecinctInExistingDistrict');
// var bestInSameDistrictMetric = new bestInSameDistrictMetricReq.Metric(gap, desiredCandidate);



var districSelectorStrategyReq = require('./DistrictSelector/LeastPrecinctsDistrictSelector');
var districSelectorStrategy = new districSelectorStrategyReq.DistrictSelector(metricToUse, prob);

var initialAssignmentStrategyReq = require('./PartitionInitializerStrategy/NonBreakingAssignmentStrtegy');
var initialAssignmentStrategy = new initialAssignmentStrategyReq.InitialAssignmentStrategy(prob, count);

var districNormalizerStrategyReq = require('./DistrictNormalizer/SmartDistrictNormalizer');
var districNormalizerStrategy = new districNormalizerStrategyReq.DistrictNormalizer(prob, 2000);


let countOfWinningDistricts;
let numberOfDistricts;

function initDistricts(data, desiredCandidate){
	data = util.fixDistrict(data)
	var districts = util.createDistrictsArray(data, gap, isAssignInitial, desiredCandidate);
	winnerAssignmentStrategy.assignWinners(districts, desiredCandidate, data, metricToUse1.metricDistrict, numberOfDistrictsToWin)
	initialPrecinctsAssignment(districts, data);
	return districts;
}

function initialPrecinctsAssignment(districts, data){
	console.log('Initial district assignment')
	var blocked = false;
	do{
		districts.forEach(function(district){
			var precinct = district.findPrecinctToAdd(sameDistrictMetric.metricPrecinct, prob)
			if (!precinct) blocked = true;
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
		var precinctToAdd = districtToAdd.findPrecinctToAdd(bestInSameDistrictMetric.metricPrecinct, prob)
		if (typeof precinctToAdd !== "undefined") districtToAdd.addPrecinct(precinctToAdd, data)
		finished = util.isAllAssigned(data)
	}
	util.printDistricts(districts,data);
}

function greedyAlgorithm(json, desiredCandidate, filename){
	var data = JSON.parse(JSON.stringify(json.features));
	var partititonFound = false;
	while (partititonFound || i >= maximalNumberOfSteps){
	var districts = initDistricts(data, desiredCandidate)
		assignPrecincts(districts, data)

		var changedPrecincts = util.calculateChangedPrecincts()    
		console.log('Number of changed precincts: '+elems.length)
		let winners = util.getWinners(districts).length;
		partititonFound = winners >=numberOfDistrictsToWin && districNormalizerStrategy.isNormalized(districts, data)
		if (partititonFound){
			json.features = data;
			util.saveAssignment(json, filename)
			
		}
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