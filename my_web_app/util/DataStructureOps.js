function sum_reduce(e1,e2){
    return e1 + e2;
}

function getDistrictNames(data, desiredCandidate, fieldName = 'uscong_dis'){
    // data is geojson.features
    var districts = data.map(function(entry){
        return entry.properties[fieldName]; 
    })
    districts = districts.filter(function(elem, index, self){
        return self.indexOf(elem) == index;
    })
    var other = 0;
    if (desiredCandidate == 0) other = 1;
    districts.sort(function(district1, district2){
        var totalInDistrict1 = data.filter(function(entry){
            return entry.properties[fieldName] == district1;
        }).map(function(entry){
            return {total:entry.properties.total, votes:[entry.properties.rep.votes, entry.properties.dem.votes]}
        }).reduce(function(all, current){
            all.total += current.total;
            all.votes[0] += current.votes[0];
            all.votes[1] += current.votes[1];
            return all;
        }, {total:0, votes:[0, 0]})
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
        entry.properties.new_district = parseInt(entry.properties.uscong_dis);
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

function isWinningFound(districts, desiredCandidate){
	var count = 0;
	districts.forEach(function(dist){
		if (dist.isWinner(desiredCandidate)){
			count ++ 
		}
	})
	if (count*2 > districts.length) return true;
	else return false;
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
module.exports.isWinningFound = isWinningFound
module.exports.getDistricsWithMinimalVotes = getDistricsWithMinimalVotes