var util = require('./DataStructureOps');
var DistrictObj = require('./District');
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
var districtNormalizerGap = factory.districtNormalizerGap();
var winnerConsideration = factory.winnerConsideration();
var maximalNumberOfChangedPrecincts = factory.maximalNumberOfChangedPrecincts();

var testMetricReq = require('./TestMetric')
testMetric = new testMetricReq.TestMetric(metricReq);
testMetric.execute();

var metricToUse = new metricReq.Metric(gap, desiredCandidate);
var winnerAssignmentStrategy = new winningAssignmentStrategyReq.InitialDistrictAssignment(metricToUse, numberOfDistrictsToWin);
var districSelectorStrategy = new districSelectorStrategyReq.DistrictSelector(metricToUse, prob, gap);
var districNormalizerStrategy;
if (districNormalizerStrategyReq)
	districNormalizerStrategy = new districNormalizerStrategyReq.DistrictNormalizer(prob, districtNormalizerGap);

var initialAssignmentStrategy = new initialAssignmentStrategyReq.InitialAssignmentStrategy();


function greedyAlgorithm(json, filename, logFile){
    var data = json.features;
    var districts = initDistricts(data, winnerConsideration)
	assignPrecincts(districts, data)
	var changedPrecincts = util.calculateChangedPrecincts(data)    
	console.log('Number of changed precincts: '+changedPrecincts.length)
	let winners = util.getWinners(districts).length;
	if (winners >= numberOfDistrictsToWin || maximalNumberOfChangedPrecincts != -1){
		console.log('Check if districts are not broken');
		districts.forEach(function(district){
			district.isConnectionBroken();
		})

		json.features = data;
		util.saveAssignment(json, filename)
		util.saveToLog(logFile, factory.discription(), districts);
		console.log('FiNISH')
	}
    return winners >=numberOfDistrictsToWin;
}


function initDistricts(data, winnerConsideration){
	data = util.fixDistrict(data)
	var districts = util.createDistrictsArray(data, gap, isAssignInitial, desiredCandidate, winnerConsideration);
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
			console.log(precinctToAdd)
			
		}
		finished = util.isWinningPartitionFound(districts, desiredCandidate, numberOfDistrictsToWin)
		finished = finished || (maximalNumberOfChangedPrecincts != -1 && maximalNumberOfChangedPrecincts <= util.calculateChangedPrecincts(data).length);
		if (finished || i == stepsBeforeNormalization){
			normalize(districts, data);
			i=0;
		}
		if (j >= maximalNumberOfSteps) break;
		finished = util.isWinningPartitionFound(districts, desiredCandidate, numberOfDistrictsToWin)
		finished = finished || (maximalNumberOfChangedPrecincts != -1 && maximalNumberOfChangedPrecincts <= util.calculateChangedPrecincts(data).length);
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
	// console.log(precintToAdd)

	return [precintToAdd, oldDistrictObj];
}

function normalize(districts, data){
	if (!districNormalizerStrategy) return;
	console.log('Start: normalization of districts');
	util.printDistricts(districts,data);
	if (isToRecalculateWinner) winnerAssignmentStrategy.assignWinners(districts, desiredCandidate, data, metricToUse.metricDistrict, numberOfDistrictsToWin)
	districNormalizerStrategy.normalize(districts, data, metricToUse.metricPrecinct)
	console.log('Stop: normalization of districts');
	util.printDistricts(districts,data);
}


module.exports.greedyAlgorithm = greedyAlgorithm