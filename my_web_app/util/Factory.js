var config = require('../config/default')
var algConfigPath = config.alg_config_path;
var algorithmConfig = require(algConfigPath);
var path = require('path');

module.exports.algorithm = function(){
	var algorithmRequire;
	if (algorithmConfig.algorithm.value == 0) algorithmRequire = require('./algorithmImprovment.js')
	else algorithmRequire = require('./AlgorithmFromInit.js')
	return algorithmRequire;
}

module.exports.prob = function(){
	return algorithmConfig.algorithm.params.prob.value;
}

module.exports.desiredCandidate = function(){
	return algorithmConfig.algorithm.params.desiredCandidate.value;
}

module.exports.numberOfDistrictsToWin = function(){
	return algorithmConfig.algorithm.params.numberOfDistrictsToWin.value;
}

module.exports.stepsBeforeNormalization = function(){
	return algorithmConfig.algorithm.params.stepsBeforeNormalization.value;
}

module.exports.isToRecalculateWinner = function(){
	return algorithmConfig.algorithm.params.isToRecalculateWinner.value;
}

module.exports.winningGap = function(){
	return algorithmConfig.algorithm.params.winningGap.value;
}

module.exports.maximalNumberOfSteps = function(){
	return algorithmConfig.algorithm.params.maximalNumberOfSteps.value;
}

module.exports.winnerConsideration = function(){
	return algorithmConfig.algorithm.params.winnerConsideration.value;
}

module.exports.maximalNumberOfChangedPrecincts = function(){
	return algorithmConfig.algorithm.params.maximalNumberOfChangedPrecincts.value;
}

module.exports.districtSelector = function(){
	var districtSelector;
	if (algorithmConfig.district_selection_strategy.value == 0) districtSelector = require('./DistrictSelector/BestLosingDistrictSelector.js')
	else if (algorithmConfig.district_selection_strategy.value == 1) districtSelector = require('./DistrictSelector/LeastVotesDistrictSelector.js')
	else if (algorithmConfig.district_selection_strategy.value == 2) districtSelector = require('./DistrictSelector/LeastPrecinctsDistrictSelector.js')
	else if (algorithmConfig.district_selection_strategy.value == 3) districtSelector = require('./DistrictSelector/RandomDistrictSelector.js')
	return districtSelector;
}

module.exports.metric = function(){
	var metric;
	if (algorithmConfig.metric.value == 0) metric = require('./Metric/DiffPrecinctMetric.js')
	else if (algorithmConfig.metric.value == 1) metric = require('./Metric/DiffPercentageMetric.js')
	return metric;
}

module.exports.precintSelector = function(){
	var precintSelector;
	if (algorithmConfig.precint_selector.value == 0) precintSelector = require('./PrecinctSelector/BestPrecinct.js')
	else if (algorithmConfig.precint_selector.value == 1) precintSelector = require('./PrecinctSelector/BestPrecinctInExistingDistrict.js')
	return precintSelector;
}

module.exports.districtNormalizer = function(){
	var districtNormalizer;
	if (algorithmConfig.district_normalizer.value == 0) districtNormalizer = require('./DistrictNormalizer/MinimalVotesDistrictNormalizer.js')
	else if (algorithmConfig.district_normalizer.value == 1) districtNormalizer = require('./DistrictNormalizer/MinimalPrecinctsDistrictNormalizer.js')
	return districtNormalizer;
}

module.exports.districtNormalizerGap = function(){
	return algorithmConfig.district_normalizer.params.gap.value;
}

module.exports.initialAssignmentStrategy = function(){
	var initialAssignmentStrategy;
	if (algorithmConfig.initial_assignment_strategy.value == 0) initialAssignmentStrategy = require('./PartitionInitializerStrategy/ConstantAssignmentStrategy.js')
	else if (algorithmConfig.initial_assignment_strategy.value == 1) initialAssignmentStrategy = require('./PartitionInitializerStrategy/NonBreakingAssignmentStrtegy.js')
	return initialAssignmentStrategy;
}

module.exports.initialAssignmentStrategyCount = function(){
	return algorithmConfig.initial_assignment_strategy.params.count.value;
}

module.exports.winningAssignmentStrategy = function(){
	var winningAssignmentStrategy;
	if (algorithmConfig.winning_assignment_strategy.value == 0) winningAssignmentStrategy = require('./WinningAssignmentStrategy/InitialWinningAssignmentStrategy.js')
	return winningAssignmentStrategy;
}

module.exports.logFile = function(){
	var logPath = path.join(__dirname, (config.default_path + config.state + config.ready_partition_path + config.log_path))
	return logPath;
}

module.exports.discription = function(){
	var str = '';
	var attrs = ['algorithm', 'district_selection_strategy', 'metric', 'precint_selector', 'district_normalizer', 'initial_assignment_strategy', 'winning_assignment_strategy']
	attrs.forEach(function(attr){
		let val = algorithmConfig[attr].value
		str += (algorithmConfig[attr]._comment +': '+ algorithmConfig[attr]['_comment_'+val])
		if (algorithmConfig[attr].hasOwnProperty('params')){
			let params = '';
			str += '.\t\n'
			Object.keys(algorithmConfig[attr].params).forEach(function(param){
				let val = algorithmConfig[attr].params[param].value;
				params += ('\t'+ algorithmConfig[attr].params[param]._comment +': '+val+'\n')
			})
			str += params;
		}
		str += '\n';
	})
	return str
}

