
function NonBreakingAssignmentStrtegy(prob=0.9, count=50){
	this.name = 'Assign precincts as is until the first one that breaks the winners';
	this.prob = prob
	this.maxCount = count
    this.isStop = function(districts, count, desiredCandidate){
		var isNotWinning = function(element){
			return element.isWinning && element.votes[desiredCandidate] < element.votes[(desiredCandidate+1)%2];
		}
		return (districts.some(isNotWinning) && count > this.maxCount) || count > (this.maxCount+50);
    }
}
module.exports.InitialAssignmentStrategy = NonBreakingAssignmentStrtegy