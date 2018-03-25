function LeastVotesDistrictSelector(metric, prob = 0.9){
    this.name = 'Least Voices district selector will select district that has minimal number of voices'
	this.prob = prob
    this.select = function(districts, desiredCandidate){
        var sorted = districts.sort(function(e1,e2){
			return e1.totalVotes - e2.totalVotes;
		})
		if (Math.random() > this.prob){
			return sorted[Math.floor(Math.random()*sorted.length)]
		}
		else{
			return sorted[0]
		} 
    }
}
module.exports.DistrictSelector = LeastVotesDistrictSelector