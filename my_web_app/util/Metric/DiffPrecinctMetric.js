function DiffPrecinctMetric(gap, desiredCandidate){
    this.name = 'Metric based on difference between votes for desired candidate and undesired candidate'
	this.desiredCandidate = desiredCandidate;
	this.gap = gap;
	
	this.metricPrecinct = function(district, data){
		let otherCandidate = (this.desiredCandidate+1)%2;
		return function(precinct1, precinct2){
			let votesDifferenceP1 = data[precinct1].properties.rep.votes - data[precinct1].properties.dem.votes;
			let votesDifferenceP2 = data[precinct2].properties.rep.votes - data[precinct2].properties.dem.votes;
			if ((desiredCandidate == 1 && district.isWinning) || (desiredCandidate == 0 && !district.isWinning)){
				votesDifferenceP1 = -votesDifferenceP1;
				votesDifferenceP2 = -votesDifferenceP2;
			}
			if (district.isWinning && district.isWinner()){
				votesDifferenceP1 = -votesDifferenceP1;
				votesDifferenceP2 = -votesDifferenceP2;
			}
			return votesDifferenceP2 - votesDifferenceP1;
		}
	};

	this.metricDistrict = function(){
		let otherCandidate = (this.desiredCandidate+1)%2;
		let that = this;
		return function(district1, district2){
			let votesDifferenceD1 = district1.votes[that.desiredCandidate] - district1.votes[otherCandidate];
			let votesDifferenceD2 = district2.votes[that.desiredCandidate] - district2.votes[otherCandidate];
			return votesDifferenceD2 - votesDifferenceD1;
		}
	}
}
module.exports.Metric = DiffPrecinctMetric