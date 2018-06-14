
function InititlaWinningAssignmentStrategy(metric, requiredNumberOfWinning){
	this.name = 'Calculate winner district based on initial partition';
	this.metric = metric;
	this.requiredNumberOfWinning = requiredNumberOfWinning

    this.assignWinners = function(districts, desiredCandidate, ){
		districts.sort(this.metric.metricDistrict())
		let isWinning = true;
		districts = districts.map((district, index)=>{
			if (index + 1 > this.requiredNumberOfWinning) isWinning = false;
			district.isWinning = isWinning;
			return district;
		});
    }
}
module.exports.InitialDistrictAssignment = InititlaWinningAssignmentStrategy