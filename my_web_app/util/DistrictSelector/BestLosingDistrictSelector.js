function BestLosingDistrictSelector(metric, prob = 0.9){
    this.name = 'Will select district that has highest quality based on provided metric and our candidate is not winning in this district'
	this.prob = prob;
	this.metric = metric;

	this.select = function(districts, desiredCandidate){
		var otherCandidate = (desiredCandidate + 1)%2;
		var filtered = districts.filter((district) => (district.votes[desiredCandidate] < district.votes[otherCandidate]))
		if (filtered.length == 0) filtered = districts
		filtered.sort(this.metric.metricDistrict())
		if (Math.random() > this.prob){
			return filtered[Math.floor(Math.random()*filtered.length)]
		}
		else{
			return filtered[0]
		} 
    }
}
module.exports.DistrictSelector = BestLosingDistrictSelector