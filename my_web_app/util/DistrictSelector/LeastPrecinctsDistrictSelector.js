function LeastPrecinctsDistrictSelector(metric, prob = 0.9){
    this.name = 'Least Precinct district selector will select district that has minimal number of precincts'
	this.prob = prob

    this.select = function(districts, desiredCandidate){
        var sorted = districts.sort(function(e1,e2){
			return e1.precincts.length - e2.precincts.length;
		})
		if (Math.random() > this.prob){
			return sorted[Math.floor(Math.random()*sorted.length)]
		}
		else{
			return sorted[0]
		} 
    }
}
module.exports.DistrictSelector = LeastPrecinctsDistrictSelector