var DistrictObj = require('./District');
var fs = require("fs");
var path = require("path");

function sum_reduce(e1,e2){
    return e1 + e2;
}

module.exports.fixDistrict = function(data){
	data = data.map(function(entry){
		let data;
		if (Array.isArray(entry.properties.all) && entry.properties.all.length > 0){
			data = entry.properties.all[0].district
		}
		else{
			data = entry.properties.all.district
		}
		if (data){
			entry.properties.uscong_dis = data.toString();
		}
		else{
			console.log('No district for precinct '+ entry.properties.name);
			console.log(entry.properties.all)
		}
		entry.properties.new_district = entry.properties.uscong_dis;
        return entry;
	});
	return data;
}

function getDistrictNames(data, fieldName = 'uscong_dis'){
    // data is geojson.features
    var districts = data.map(function(entry){
        return entry.properties[fieldName]; 
    })
    districts = districts.filter(function(elem, index, self){
        return self.indexOf(elem) == index;
    })
    return districts;
}


function getVotesInDistrict(data, district, fieldName = 'uscong_dis'){
    // returns structure
    // structure.precicnts = # precincts in district
    // structure.total = # votes in district
    // structure.votes = [# votes for republican in district, # votes for democrat in district]
    var votesDistrict = data.filter(function(entry){
        return entry.properties[fieldName] == district; 
    })
    var votesTotalInDistrict = votesDistrict.map(function(elem){
        return elem.properties.total;
    }).reduce(sum_reduce,0);
    var votesDemInDistrict = votesDistrict.map(function(elem){
        return elem.properties.dem.votes || 0;
    }).reduce(sum_reduce,0);
    var votesRepInDistrict = votesDistrict.map(function(elem){
        return elem.properties.rep.votes || 0;
    }).reduce(sum_reduce,0);
    return {precincts: votesDistrict.length, total:votesTotalInDistrict, votes:[votesRepInDistrict,votesDemInDistrict]}
}


function isWinningParitionFound(data, desiredCandidate, fieldName = 'uscong_dis'){
    var numberOfCurrentlyWinning = 0;
    var other = 1;
    if (desiredCandidate == 1) other = 0

    existingDistricts.forEach(function(district){
        var dataTemp = getVotesInDistrict(data,district, fieldName);
        if (dataTemp.votes[desiredCandidate] > dataTemp.votes[other]) numberOfCurrentlyWinning ++;
    });
    var count = Math.ceil(existingDistricts.length/2)
    if (count > numberOfCurrentlyWinning + 1) count = numberOfCurrentlyWinning + 1;
    return count
}


function getNumberOfDistrictsToWin(data, existingDistricts, desiredCandidate, fieldName = 'uscong_dis'){
    var numberOfCurrentlyWinning = 0;
    var other = 1;
    if (desiredCandidate == 1) other = 0

    existingDistricts.forEach(function(district){
        var dataTemp = getVotesInDistrict(data,district, fieldName);
        if (dataTemp.votes[desiredCandidate] > dataTemp.votes[other]) numberOfCurrentlyWinning ++;
    });
    var count = Math.ceil(existingDistricts.length/2)
    if (count > numberOfCurrentlyWinning + 1) count = numberOfCurrentlyWinning + 1;
    return count
}

function isAllAssigned(data){
    var temp = data.filter(function(precinct){
        return precinct.properties.new_district == 'None'
    })
    return (temp.length == 0)
}

function applyEmptyDistrictToData(data){
    data = data.map(function(entry){
        entry.properties.new_district = 'None';
        return entry;
    });
}

function copyDistrictToData(data) {
	data = data.map(function(entry){
		let data;
		if (Array.isArray(entry.properties.all) && entry.properties.all.length > 0){
			data = entry.properties.all[0].district
		}
		else{
			data = entry.properties.all.district
		}
		if (data){
			entry.properties.uscong_dis = data.toString();
		}
		else{
			console.log('No district')
			console.log(entry.properties.all)
		}
		entry.properties.new_district = entry.properties.uscong_dis;
        return entry;
	});
	return data;
}

function getDistricsWithMinimalPrecincts(districts, prob=1.0){
	var sorted = districts.sort(function(e1,e2){
		return e1.precincts.length - e2.precincts.length
	})
	if (Math.random() > prob){
        return sorted[Math.floor(Math.random()*sorted.length)]
    }
    else{
        return sorted[0]
    } 
}

function getDistricsWithMinimalVotes(districts, prob=1.0){
	var sorted = districts.sort(function(e1,e2){
		return e1.totalVotes - e2.totalVotes
	})
	if (Math.random() > prob){
        return sorted[Math.floor(Math.random()*sorted.length)]
    }
    else{
        return sorted[0]
    } 
}


function isBorderPrecinct(precinctId, district, data){
	var precinct = data[precinctId]
	var isBorder = false;
	precinct.properties.neighbours.forEach(function(entry){
		if (data[entry].properties.uscong_dis != district){
			isBorder = true;
			return true;
		}
	})
	return isBorder;
}

module.exports.isWinningPartitionFound = function(districts, desiredCandidate, numberOfDistrictsToWin){
	var count = 0;
	districts.forEach(function(dist){
		if (dist.isWinner(desiredCandidate)){
			count ++ 
		}
	})
	if (count >= numberOfDistrictsToWin) return true;
	else return false;
}

module.exports.createDistrictsArray = function(data, gap, isAssignInitial, desiredCandidate){
	var existingDistricts = getDistrictNames(data)
    var numberOfDistricts = existingDistricts.length
    var districts = [];
    existingDistricts.forEach(function(district){
        var districtTemp = new DistrictObj.District(data, desiredCandidate, true, district, gap, isAssignInitial=isAssignInitial);
        districts.push(districtTemp);
	})
	return districts
}

module.exports.randomSortWP = function(elements, prob){
	if (Math.random() < prob) return elements;
	return elements.sort(function() {
		return .5 - Math.random();
	});
}

module.exports.calculateChangedPrecincts = function(data){
	var elems = data.filter(function(entry){
        return entry.properties.uscong_dis != entry.properties.new_district;
	})
	return elems;
}

module.exports.getWinners = function(districts){
	return districts.filter((district)=>district.isWinner());
}

module.exports.saveAssignment = function(json, filename){
	json.features = json.features.map(function(entry, index){
		entry.properties.uscong_dis = entry.properties.new_district
		return entry;
	})
	var foundPartition = JSON.stringify(json);
	fs.writeFileSync(filename, foundPartition, function(err) {
		if(err) {
			return console.log(err);
		}
	});
	console.log('Partition saved to '+ filename);
}

module.exports.saveToLog = function(logPath, description, districts){
	let data = districts.map((entry)=>({name:entry.name, votes:entry.votes, precincts: entry.precincts.length}));
	// logPath = path.join(__dirname, logPath)
	console.log(logPath)
	
	if (fs.existsSync(logPath)) {
		console.log('File exists')
		fs.readFile(logPath, function (err, data) {
			if (err){
				console.log(err)
			}
			var json = JSON.parse(data)
			var lastId = json.map((entry)=>entry.id);
			if (lastId.length > 0) lastId=Number(lastId[lastId.length-1]);
			else lastId = 0;
			json.push({id:lastId+1, description: description})
			fs.writeFileSync(logPath, JSON.stringify(json), function(err){
				if(err) {
					return console.log(err);
				}
			})
		})
	}
	else{
		console.log('File doesnt exists')
		var json = [{id:0, description: description, data:data}]
		fs.writeFileSync(logPath, JSON.stringify(json), function(err){
			if(err) {
				return console.log(err);
			}
		})
	}
}

module.exports.printDistricts = function(districts, data){
    districts.forEach(function(district){
        district.print();
    })
}

module.exports.findNewDistrict = function(precinct, data){
	var precinctObj = data[precinct];
	var possibleDistrictcs = precinctObj.properties.neighbours.filter(
		(other)=>data[other].properties.new_district != precinctObj.properties.new_district).map(
			(entry)=> data[entry].properties.new_district);
	if (possibleDistrictcs.length == 0) return null;
	else return possibleDistrictcs[Math.floor(Math.random()*possibleDistrictcs.length)]

}

module.exports.getDistricsWithMinimalPrecincts = getDistricsWithMinimalPrecincts
module.exports.isBorderPrecinct = isBorderPrecinct
module.exports.copyDistrictToData = copyDistrictToData
module.exports.getNumberOfDistrictsToWin = getNumberOfDistrictsToWin
module.exports.isWinningParitionFound = isWinningParitionFound
module.exports.getVotesInDistrict = getVotesInDistrict
module.exports.getDistrictNames = getDistrictNames
module.exports.isAllAssigned = isAllAssigned
module.exports.applyEmptyDistrictToData = applyEmptyDistrictToData
module.exports.getDistricsWithMinimalVotes = getDistricsWithMinimalVotes