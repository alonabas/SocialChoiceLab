var util = require('./DataStructureOps');
var DistrictObj = require('./District');
var metrics = require('./SortMetrics');
var fs = require("fs");
var prob = 0.9
var countOfSame = 300


function initDistricts(data, desiredCandidate){
    util.applyEmptyDistrictToData(data)
    var existingDistricts = util.getDistrictNames(data)
    var numberOfDistricts = existingDistricts.length
    var countOfWinningDistricts = util.getNumberOfDistrictsToWin(data, existingDistricts, desiredCandidate)
    var districts = [];
    var isWinning = true;
    var count = 0
    existingDistricts.forEach(function(district){
        var districtTemp = new DistrictObj.District(isWinning, district, data);
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
	let i = 0;
	while(found && i < countOfSame){
		var found = true;
        
   		districts.forEach(function(district){
			var precinct = district.findPrecinctToAdd(data, metrics.ExistingDistrict, prob, desiredCandidate)
			district.addPrecinct(precinct, data)
            // printMissing(data);
		});
		i++;
	}
    // printDistricts(districts,data);
	var finished = util.isAllAssigned(data)
	i = 0
    while(!finished){
		var districtToAdd = util.getDistricsWithMinimalPrecincts(districts, prob);
		var precinct = districtToAdd.findPrecinctToAdd(data, metrics.BestPrecinct, prob, desiredCandidate)
		if (typeof precinct !== "undefined") districtToAdd.addPrecinct(precinct, data)
			// printMissing(data);
		finished = util.isAllAssigned(data)
		// printMissing(data);

		// printDistricts(districts, data);
		i++
    }
    
    printDistricts(districts,data);
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
    
    return {json: json, found:(winners >=requestedWinners)};
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