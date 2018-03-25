var util = require('../DataStructureOps');

function MinimalVotesDistrictNormalizer(prob = 0.9, allowedGap = 2000){
    this.name = 'District Normalizer: Number of votes in each districts should be close (with diff up to'+allowedGap+')';
	this.prob = prob;
	this.allowedGap = allowedGap;
	this.isRemovePrecicnts = false;
	this.isNormalized = function(districts, data){
		let totalVoices = districts.map(x=>(x.totalVotes)).reduce((xs,x)=>(xs+x),0);
		let minimalVoicesInDistrict = totalVoices/districts.length - this.allowedGap;
		districts.sort((e1,e2)=>(e1.totalVotes - e2.totalVotes));
		return districts[0].totalVotes >= minimalVoicesInDistrict;

	}

	this.getDistrict = function(districts){
		districts.sort((e1,e2)=>(e1.totalVotes - e2.totalVotes));
		if (this.isRemovePrecicnts){
			return districts[districts.length - 1];
		}
		else{
			return districts[0];
		}
	}

	this.checkStopCondition = function(district, gap, required, steps){
		var elem = district.totalVotes - gap < required;
		if (this.isRemovePrecicnts){
			elem = district.totalVotes + gap > required;
		}
		if (steps){
			elem = elem && steps < 200;
		}
		return elem;
	}

	this.getPrecinct = function(curDistrict, data, metric, districts){
		if (!this.isRemovePrecicnts){
			var potentialToAdd = curDistrict.getAllPotentialPrecinctsSorted(metric);
			var oldDistrictObj;
			var precintToAdd = potentialToAdd.find(function(entry){
				var curPrecinct = data[entry];
				var oldDistrict = curPrecinct.properties.new_district;
				oldDistrictObj = districts.filter(function(dist){
					return dist.name == oldDistrict
				});
				if (oldDistrictObj.length > 0){
					oldDistrictObj = oldDistrictObj[0];
					if (!oldDistrictObj.isBreaksConnection(entry)){
						return true
					}
				}
				return false;
			})
			return [precintToAdd,oldDistrictObj]
		}
		else{
			var potentialToRemove = curDistrict.getAllPotentialPrecinctsToRemoveSorted(metric);
			var precinct;
			if (Math.random() > this.prob) precinct = potentialToRemove[Math.floor(Math.random()*potentialToRemove.length)]
			else precinct = potentialToRemove[potentialToRemove.length-1]
			var newDistrict = util.findNewDistrict(precinct, data)
			let newDistrictObj = districts.filter((entry)=>(entry.name == newDistrict));
			return [precinct,newDistrictObj[0]]
		}
	}

	this.update = function(precinct, curDistrict, otherDistrict){
		if (this.isRemovePrecicnts){
			curDistrict.removePrecinct(precinct);
			otherDistrict.addPrecinct(precinct)
		}
		else{
			curDistrict.addPrecinct(precinct);
			otherDistrict.removePrecinct(precinct)

		}
	}
    this.normalize = function(districts, data, metric){
		let totalVoices = districts.map(x=>(x.totalVotes)).reduce((xs,x)=>(xs+x),0);
		let minimalVoicesInDistrict = totalVoices/districts.length - this.allowedGap;
		let maximalVoicesInDistrict = totalVoices/districts.length + this.allowedGap;
		let found = false;
		let prev = 0
		let i=0
		let required;
		while(!found && i<100){
			required = minimalVoicesInDistrict;
			this.isRemovePrecicnts = false;
			if(Math.random()>0.0){
				console.log('Will remove precincts')
				required = maximalVoicesInDistrict
				this.isRemovePrecicnts = true;
			}
			let curDistrict = this.getDistrict(districts)
			if(!this.checkStopCondition(curDistrict, 0, required)){
				found = true;
				break;
			}
			if (Math.random() > this.prob) curDistrict = districts[Math.floor(Math.random()*districts.length)]
			let j=0;
			let randomGap = 0
			while(this.checkStopCondition(curDistrict, randomGap, required, j)){
				var [precinct, otherDistrict] = this.getPrecinct(curDistrict, data, metric, districts);
				if (precinct){
					this.update(precinct, curDistrict, otherDistrict)
				}
				else{
					found = true
				}
				j++;
				randomGap = Math.floor(Math.random()*this.allowedGap)
			}
			i++;
		}
    }
}
module.exports.DistrictNormalizer = MinimalVotesDistrictNormalizer