function BestPrecinctSelector(desiredCandidate, metric, prob){
    this.name = 'Metric that adds best precinct to its district as is'
	this.desiredCandidate = desiredCandidate;
	this.metric = metric;
	this.prob = prob

	this.select = function(district, precincts, data){
		precincts.sort(this.metric.metricPrecinct(district, data));
		if (Math.random() > this.prob){
			return precincts[Math.floor(Math.random()*precincts.length)]
		}
		else{
			return precincts[0]
		}
	};
}
module.exports.PrecinctSelector = BestPrecinctSelector