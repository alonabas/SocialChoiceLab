var util = require('../DataStructureOps');

function MinimalPrecinctsDistrictNormalizer(prob = 0.9, allowedGap = 20){
    this.name = 'District Normalizer: Number of votes in each districts should be close (with diff up to'+allowedGap+')';
	this.prob = prob;
	this.allowedGap = allowedGap;

	this.isNormalized = function(districts, data){
		let totalPrecincts = districts.map(x=>(x.precincts.length)).reduce((xs,x)=>(xs+x),0);
		let minimalPrecinctsInDistrict = totalPrecincts/districts.length - this.allowedGap;
		districts.sort((e1,e2)=>(e1.precincts.length - e2.precincts.length));
		return districts[0].precincts.length >= minimalPrecinctsInDistrict;

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
			util.randomSortWP(potentialToAdd, prob)
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
			potentialToRemove.reverse()
			util.randomSortWP(potentialToRemove, prob)
			let precinct = potentialToRemove.find(function(entry){
				var curPrecinct = data[entry];
				if (!curDistrict.isBreaksConnection(entry)){
					return true
				}
				return false;
			})			
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
		let totalPrecincts = districts.map(x=>(x.precincts.length)).reduce((xs,x)=>(xs+x),0);
		let minimalPrecinctsInDistrict = totalPrecincts/districts.length - this.allowedGap;
		let maximalPrecinctsInDistrict = totalPrecincts/districts.length + this.allowedGap;
		let found = false;
		let prev = 0
		let i=0
		let required;
		while(!found && i<100){
			required = minimalPrecinctsInDistrict;
			this.isRemovePrecicnts = false;
			if(Math.random()>0.1){
				console.log('Will remove precincts')
				required = maximalPrecinctsInDistrict
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
module.exports.DistrictNormalizer = MinimalPrecinctsDistrictNormalizer