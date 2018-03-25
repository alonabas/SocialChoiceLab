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
var isAssignInitial = true;
var maximalNumberOfSteps = factory.maximalNumberOfSteps();

var metricReq = factory.metric();
var winningAssignmentStrategyReq = factory.winningAssignmentStrategy()
var districSelectorStrategyReq = factory.districtSelector();
var districNormalizerStrategyReq = factory.districtNormalizer();
var initialAssignmentStrategyReq = factory.initialAssignmentStrategy();


var testMetricReq = require('./TestMetric')
testMetric = new testMetricReq.TestMetric(metricReq);
testMetric.execute();

var metricToUse = new metricReq.Metric(gap, desiredCandidate);
var winnerAssignmentStrategy = new winningAssignmentStrategyReq.InitialDistrictAssignment(metricToUse, numberOfDistrictsToWin);
var districSelectorStrategy = new districSelectorStrategyReq.DistrictSelector(metricToUse, prob);
var districNormalizerStrategy = new districNormalizerStrategyReq.DistrictNormalizer(prob, gap);
var initialAssignmentStrategy = new initialAssignmentStrategyReq.InitialAssignmentStrategy();


function greedyAlgorithm(json, desiredCandidate, filename){
    var data = json.features;
    var districts = initDistricts(data, desiredCandidate)
	assignPrecincts(districts, data)
	var changedPrecincts = util.calculateChangedPrecincts(data)    
	console.log('Number of changed precincts: '+changedPrecincts.length)
	let winners = util.getWinners(districts).length;
	if (winners >= numberOfDistrictsToWin){
		json.features = data;
		util.saveAssignment(json, filename)
		util.saveToLog(factory.logFile(), factory.discription(), districts);
	}
    return winners >=numberOfDistrictsToWin;
}


function initDistricts(data){
	data = util.fixDistrict(data)
	var districts = util.createDistrictsArray(data, gap, isAssignInitial, desiredCandidate);
	winnerAssignmentStrategy.assignWinners(districts, desiredCandidate, data, metricToUse.metricDistrict, numberOfDistrictsToWin)
	return districts;
}

function assignPrecincts(districts, data){
	console.log('Start: assign precincts')
	util.printDistricts(districts,data);
	var finished = util.isWinningPartitionFound(districts, desiredCandidate, numberOfDistrictsToWin)
	var i = 0, j = 0;
	while(!finished){
		var districtToAdd = districSelectorStrategy.select(districts, desiredCandidate);
		var [precinctToAdd, oldDistrictObj] = selectPrecinct(districtToAdd, data, districts)
		if (precinctToAdd){
			districtToAdd.addPrecinct(precinctToAdd);
			oldDistrictObj.removePrecinct(precinctToAdd)
		}
		else{
			console.log('No precincts to add to district '+districtToAdd.name)
			console.log(precinctToAdd.potentialToAdd)
		}
		finished = util.isWinningPartitionFound(districts, desiredCandidate, numberOfDistrictsToWin)
		if (finished || i == stepsBeforeNormalization){
			normalize(districts, data);
			i=0;
		}
		if (j >= maximalNumberOfSteps) break;
		finished = util.isWinningPartitionFound(districts, desiredCandidate, numberOfDistrictsToWin)
		i++;
		j++;
    }
}


function selectPrecinct(districtToAdd, data, districts){
	var potentialToAdd = districtToAdd.getAllPotentialPrecinctsSorted(metricToUse.metricPrecinct);
	util.randomSortWP(potentialToAdd, prob)
	var done = false;
	var oldDistrictObj;
	var precintToAdd = potentialToAdd.find(function(entry){
		var curPrecinct = data[entry];
		var oldDistrict = curPrecinct.properties.new_district;
		oldDistrictObj = districts.filter(function(dist){
			return dist.name == oldDistrict
		});
		if (oldDistrictObj.length > 0){
			oldDistrictObj = oldDistrictObj[0];
			if (!oldDistrictObj.isBreaksConnection(entry)){
				return true
			}
		}
		return false;
	})
	return [precintToAdd, oldDistrictObj];
}

function normalize(districts, data){
	console.log('Start: normalization of districts');
	util.printDistricts(districts,data);
	if (isToRecalculateWinner) winnerAssignmentStrategy.assignWinners(districts, desiredCandidate, data, metricToUse.metricDistrict, numberOfDistrictsToWin)
	districNormalizerStrategy.normalize(districts, data, metricToUse.metricPrecinct)
	console.log('Stop: normalization of districts');
	util.printDistricts(districts,data);

}


module.exports.greedyAlgorithm = greedyAlgorithm