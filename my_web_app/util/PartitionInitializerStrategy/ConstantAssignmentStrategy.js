function ConstantAssignmentStrategy(prob=0.9, count=200){
	this.maxCount = count
    this.name = 'Assign '+this.count+' precincts as is';
	this.prob = prob
    this.isStop = function(districts, count, desiredCandidate){
        return count >= this.maxCount;
    }
}
module.exports.InitialAssignmentStrategy = ConstantAssignmentStrategy