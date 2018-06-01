function ExistingDistrictPrecinctSelector(desiredCandidate, prob, metric){
    this.name = 'Metric that adds best precinct to its district as is'
	this.desiredCandidate = desiredCandidate;
	this.prob = prob
	this.metric = metric
	this.select = function(district, precincts, data, initial = 1){
		if (initial == 1) return this.otherSelect(district, precincts, data);
 		var selected = precincts.filter((entry)=>(data[entry].properties.uscong_dis == district.name)).sort(this.metric.metricPrecinct(district, data));
		if (Math.random() > this.prob){
			return selected[Math.floor(Math.random()*selected.length)]
		}
		else{
			return selected[0]
		}
	};
	this.otherSelect = function(district, precincts, data){
		let functionToCompare = this.metric.metricPrecinct(district, data);
 		var selected = precincts.sort(function(e1,e2){
			let part1 = functionToCompare(e1, e2);
			if (data[e1].properties.uscong_dis == district) return part1;
			else return part1 - 500;
		 });
		if (Math.random() > this.prob){
			return selected[Math.floor(Math.random()*selected.length)]
		}
		else{
			return selected[0]
		}
	};
}
module.exports.PrecinctSelector = ExistingDistrictPrecinctSelector