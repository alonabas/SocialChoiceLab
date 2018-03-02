var util = require('./DataStructureOps');
var DistrictObj = require('./District');
var metrics = require('./SortMetrics');
var fs = require("fs");
var prob = 0.9
var countOfSame = 250


function initDistricts(data, desiredCandidate){
    data = util.copyDistrictToData(data)
    var existingDistricts = util.getDistrictNames(data)
    var numberOfDistricts = existingDistricts.length
    var countOfWinningDistricts = util.getNumberOfDistrictsToWin(data, existingDistricts, desiredCandidate)
    var districts = [];
    var isWinning = true;
    var count = 0
    existingDistricts.forEach(function(district){
        var districtTemp = new DistrictObj.District(isWinning, district, data, isAssignInitial=true);
        districts.push(districtTemp);
        count ++;
        if (count >= countOfWinningDistricts) isWinning = false;
	})
    // printDistricts(districts,data);
    return districts;
}

function greedyAlgorithm(json, desiredCandidate, filename){
    var data = json.features;
    var districts = initDistricts(data, desiredCandidate)

	var finished = util.isWinningFound(districts, desiredCandidate) //??
	var i = 0;
    while(!finished){
		// select district with maximal number of precincts and move one precinct
		var districtToAdd = util.getDistricsWithMinimalVotes(districts, 0.6);
		var potentialToAdd = districtToAdd.getAllPotentialPrecinctsSorted(data, metrics.BestPrecinct, desiredCandidate);
		if (Math.random() > prob){
			potentialToAdd = districtToAdd.potentialPrecinctsToAdd;
		}
		var done = false;
		var oldDistrictObj
		var precintToAdd = potentialToAdd.find(function(entry){
			var curPrecinct = data[entry];
			var oldDistrict = curPrecinct.properties.new_district;
			oldDistrictObj = districts.filter(function(dist){
				return dist.name == oldDistrict
			});
			if (oldDistrictObj.length > 0){
				oldDistrictObj = oldDistrictObj[0];
				if (!oldDistrictObj.isBreaksConnection(entry, data)){
					return true;
				}
			}
			return false;
		})
		console.log(districtToAdd.name)
		console.log(oldDistrictObj.name);
		console.log('After')
		if (precintToAdd){
			districtToAdd.addPrecinct(precintToAdd, data);
			oldDistrictObj.removePrecinct(precintToAdd, data)
		}
        finished = util.isWinningFound(districts, desiredCandidate)
		printDistricts(districts,data);
		i++
		// if (i==100)
		// 	return 
    }
    
    
    var elems = data.filter(function(entry){
        return entry.properties.uscong_dis != entry.properties.new_district;
    })
    console.log('Number of changed precincts '+elems.length)
    	
	data.map(function(entry, index){
		entry.properties.uscong_dis = entry.properties.new_district
	})
    json.features = data;
	var foundPartition = JSON.stringify(json);
	var winners = 0;
	var requestedWinners = 0
	districts.forEach(function(district){
		if (district.isWinner(desiredCandidate)) winners++;
		if (district.isWinning) requestedWinners ++;
	})
	console.log('winners: '+winners+', requestsed: '+requestedWinners+ '(winners >=requestedWinners = '+winners >=requestedWinners+')');
	if (winners >=requestedWinners){
		console.log('save to file')
    	fs.writeFileSync(filename, foundPartition, function(err) {
        	if(err) {
            	return console.log(err);
        	}
    	});
	}
    json.features = data;
    console.log(filename)
    
    return {json: json, found:winners >=requestedWinners};
}


function printDistricts(districts, data){
    districts.forEach(function(district){
        district.print();
    })
    printMissing(data);

}

function printMissing(data){
    var missing = data.filter(function(entry){
        return entry.properties.new_district == 'None';
    })
    console.log('Missing partition for '+missing.length)
}

function normalizeDistrictNeighbours(newDistricts, data){

    newDistricts = newDistricts.map(function(entry){
        entry.neighbours = entry.neighbours.filter(function(neighbour){
            return data[neighbour].properties.new_district == 'None'
        })
        return entry
    })
    return newDistricts
}

function selectDistrict(newDistricts){
    var sorted = newDistricts.sort(function(e1,e2){
        return e1.precincts.length - e2.precincts.length
    })
    if (Math.random() > prob){
        return sorted[Math.floor(Math.random()*sorted.length)]
    }
    else{
        return sorted[0]
    } 
    
}

module.exports.greedyAlgorithm = greedyAlgorithm