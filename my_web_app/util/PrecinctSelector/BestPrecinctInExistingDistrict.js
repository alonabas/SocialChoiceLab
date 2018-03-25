function ExistingDistrictPrecinctSelector(desiredCandidate, prob, matric){
    this.name = 'Metric that adds best precinct to its district as is'
	this.desiredCandidate = desiredCandidate;
	this.prob = prob

	this.select = function(district, precincts, data){
		var selected = precincts.filter((entry)=>(data[entry].properties.uscong_dis == district.name)).sort(this.metric.metricPrecinct(district, data));
		if (Math.random() > this.prob){
			return selected[Math.floor(Math.random()*selected.length)]
		}
		else{
			return selected[0]
		}
	};
}
module.exports.PrecinctSelector = ExistingDistrictPrecinctSelector