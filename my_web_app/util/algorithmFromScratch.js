var fs = require('fs');
function sum_reduce(e1,e2){
    return e1 + e2;
}

var prob = 0.95

function greedyAlgorithm(json, desiredCandidate, filename, callback){
    var data = json.features;
    var existingDistricts = getDistricts(data)
    var numberOfDistricts = existingDistricts.length
    var countOfWinningDistricts = calculateWinningDistrict(existingDistricts, desiredCandidate, data)
    data = applyEmptyDistrictToData(data)
    var newDistricts = initDistricts(data, countOfWinningDistricts, numberOfDistricts, existingDistricts, desiredCandidate)
    newDistricts = normalizeDistrictNeighbours(newDistricts,data);
    newDistricts = fillDistricts(newDistricts, data, desiredCandidate)
    // District = {isWinning: true/flase, neighbours:[], name:String, precincts:[ids]}
    // var finished = isFinished(data, newDistricts)
    // while(!finished){
    //     var district = selectDistrict(newDistricts)
    //     addPrecinctToDistrict(newDistricts, data)
    //     finished = isFinished(data, newDistricts)
    printData(data)
	// }
	var elems = data.map(function(entry){
        return entry.properties.uscong_dis = entry.properties.new_district;
    })

    json.features = data;
    var foundPartition = JSON.stringify(json);
    fs.writeFileSync(filename, foundPartition, function(err) {
        if(err) {
            return console.log(err);
		}
		if (callback){
			callbackify(foundPartition)
		}
    });
    
    console.log(filename)
    
    return json;
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
function fillDistricts(newDistricts, data, desiredCandidate){
    var isFound = data.filter(function(entry){
        return entry.properties.new_district == 'None';
    }).length == 0;
    while(!isFound){
        // select district with minimal number of precincts
        var district = selectDistrict(newDistricts)
        if (district.neighbours.length > 0){
            district.neighbours = district.neighbours.sort(function(e1, e2){
                var tempe1 = data[e1].properties.rep.votes - data[e1].properties.dem.votes;
                var tempe2 = data[e2].properties.rep.votes - data[e2].properties.dem.votes;
                if (desiredCandidate == 1){
                    tempe1 = -tempe1
                    tempe2 = -tempe2
                }
                if (!district.isWinning) return tempe2 - tempe1;
                else return tempe1-tempe2;
            })
            var precinct;
            if (Math.random() > prob){
                var index = Math.floor(Math.random()*district.neighbours.length);
                precinct = district.neighbours[index];
                district.neighbours.splice(index,1);
            }
            else{
                precinct = district.neighbours.pop();
            } 
            district.precincts.push(precinct)
            // console.log('Precinct '+precinct )
            data[precinct].properties.new_district = district.name;
            data[precinct].properties.neighbours.forEach(function(neighbour){
                if (data[neighbour].properties.new_district == 'None' && district.neighbours.indexOf(neighbour) == -1){
                    district.neighbours.push(neighbour);
                }
            })
            normalizeDistrictNeighbours(newDistricts, data);
        }
        var still = data.filter(function(entry){
            return entry.properties.new_district == 'None';
        })
        isFound = (still.length == 0)
    }
    printData(data)
    return newDistricts;
}

function printData(data){
    console.log('print')
    var districts = getDistricts(data)
    var str;
    districts.forEach(function(district){
        var temp = getVotesInDistrict(data, district, true);
        if (temp.votes[0]> temp.votes[1]) str = 'REP won'
        else str = 'DEM won'
        console.log('District '+district + ' has '+temp.total +' votes and '+temp.precincts +
            ' precincts, ' + temp.votes[0] +' for republican candidate and '+temp.votes[1] + ' for democrat candidate. '
            +str + ' with diff: '+(temp.votes[0] - temp.votes[1]))
    })
    var missing = data.filter(function(entry){
        return entry.properties.new_district == 'None';
    })
    console.log('Missing partition for '+missing.length)
}

function initDistricts(data, countOfWinningDistricts, numberOfDistricts, existingDistricts, desiredCandidate){
    // init about 50% of each district with existing data
    var newDistricts = []
    var other = 1;
    if (desiredCandidate == 1) other = 0

    existingDistricts = existingDistricts.sort(function(e1,e2){
        var votesData1 = getVotesInDistrict(data, e1);
        var votesData2 = getVotesInDistrict(data, e2);
        var tempe1 = votesData1.votes[0] - votesData2.votes[1];
        var tempe2 = votesData2.votes[0] - votesData1.votes[1]
        if (desiredCandidate == 0){
            return tempe1 - tempe2;
        }
        else {
            return tempe2 - tempe1;
        }
    })

    var i = 1
    existingDistricts.forEach(function(entry){
        var votes = getVotesInDistrict(data, entry);
        var isWinning = true;
        if (i > countOfWinningDistricts){
            isWinning = false;
        }
        var neighbours = addPrecinctsToDistrict(data, 200,entry, isWinning, desiredCandidate);
        var precincts = data.filter(function(entry){
            return entry.properties.new_district == entry
        }).map(function(entry){
            return entry.properties.entryId;
        })
        newDistricts.push({isWinning:isWinning,neighbours:neighbours, name: entry,precincts:precincts})
        i++;
    })
    return newDistricts

}

function addPrecinctsToDistrict(data, count, district, isWinning, desiredCandidate){
    var precinctsInThisDistrict = data.filter(function(entry){
        return entry.properties.uscong_dis == district;
    })
    precinctsInThisDistrict = precinctsInThisDistrict.sort(function(e1,e2){
        var tempe1 = e1.properties.rep.votes - e1.properties.dem.votes;
        var tempe2 = e2.properties.rep.votes - e2.properties.dem.votes;
        if (desiredCandidate == 1){
            tempe1 = -tempe1
            tempe2 = -tempe2
        }
        if(isWinning)
            return tempe2 - tempe1;
        else
            return tempe1 - tempe2;
    })
    var i = 0;
    var firstPresinct = precinctsInThisDistrict[0].properties.entryId
    var elems = []
    elems.push(firstPresinct)
    var diff = 0
    while (i<count && elems.length > 0){
        var curElem;
        var filteredElems = elems.filter(function(entry){
            return data[entry].properties.uscong_dis == district;
        })
        if (Math.random() > prob){
            var index = Math.floor(Math.random()*filteredElems.length);
            curElem = filteredElems[index];
            filteredElems.splice(index,1);
        }
        else{
            curElem = filteredElems.pop();
        }
        var indexTemp = elems.indexOf(curElem);
        if (indexTemp > -1) elems.splice(indexTemp,1);

        data[curElem].properties.new_district = district;
        if (isWinning)
            diff += (data[curElem].properties.rep.votes - data[curElem].properties.dem.votes)
        data[curElem].properties.neighbours.forEach(function(neighbour){
            if (data[neighbour].properties.new_district == 'None' && elems.indexOf(neighbour) == -1){
                elems.push(neighbour);
            }
        })
        elems = elems.sort(function(e1,e2){
            
            var tempe1 = data[e1].properties.rep.votes - data[e1].properties.dem.votes;
            var tempe2 = data[e2].properties.rep.votes - data[e2].properties.dem.votes;
            if (desiredCandidate == 1){
                tempe1 = -tempe1
                tempe2 = -tempe2
            }
            if (!isWinning) return tempe2 - tempe1;
            else{
                tempe1 = tempe1 + diff;
                tempe2 = tempe2 + diff;
            }
            if (tempe1 < 0 || tempe2 < 0) return tempe1-tempe2;
            else return tempe2-tempe1;
        })
        i++;
    }
    return elems;
}


function applyEmptyDistrictToData(data){
    data = data.map(function(entry){
        entry.properties.new_district = 'None';
        return entry;
    });
    return data;
    
}

function getDistricts(data){
    var districts = data.map(function(entry){
        return entry.properties.uscong_dis; 
    })
    districts = districts.filter(function(elem, index, self){
        return self.indexOf(elem) == index;
    })
    return districts;
}

function calculateWinningDistrict(existingDistricts, desiredCandidate, data){
    var numberOfCurrentlyWinning = 0;
    var other = 1;
    if (desiredCandidate == 1) other = 0

    existingDistricts.forEach(function(district){
        var dataTemp = getVotesInDistrict(data,district);
        if (dataTemp.votes[desiredCandidate] > dataTemp.votes[other]) numberOfCurrentlyWinning ++;
    });
    var count = Math.ceil(existingDistricts.length/2)
    if (count > numberOfCurrentlyWinning + 1) count = numberOfCurrentlyWinning + 1;
    return count
}

function getVotesInDistrict(data, district, isNew = false){
    var votesDistrict = data.filter(function(entry){
        if (isNew) return entry.properties.new_district == district; 
        return entry.properties.uscong_dis == district; 
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


module.exports.greedyAlgorithm = greedyAlgorithm