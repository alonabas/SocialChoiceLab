
/**
* Algorithm from paper: Divide and Conquer: Using Geographic Manipulation to Win District-Based Elections
*/

// var districtSelector = require('./DistrictSelector/RandomDistrictSelector');
// var districtSelector = require('./DistrictSelector/RandomLosingDistricSelector');
var districtSelector = require('./DistrictSelector/LeastVoicesMissingDistrictSelector');
// var precinctSelector = require('./PrecinctSelector/BasicAdditionPrecinctSelector');
// var precinctSelector = require('./PrecinctSelector/BestPrecinctSelector');
var precinctSelector = require('./PrecinctSelector/BasicAdditionPrecinctSelector');
var districtNormalizer = require('./DistrictNormalizer/SmartDistrictNormalizer');
var fs = require('fs');
var turf = require('@turf/turf');
var geojson;
const candidate_map = ['rep','dem']
function sum_reduce(e1,e2){
    return e1 + e2;
}

function setGeoJson(geoFile){
    console.log('set geo json')
    geojson = geoFile
}

function comparisonFunction(e1,e2, candidate, isReverse = false){
    if (candidate == 1){
        var temp = e1.properties.rep.votes/e1.properties.total - e2.properties.rep.votes/e2.properties.total;
        return isReverse ? -temp : temp
    } else{
        var temp = e1.properties.rep.votes/e1.properties.total - e2.properties.rep.votes/e2.properties.total;
        return isReverse ? -temp : temp;
    }
}

function comparisonFunction2(e1,e2, candidate, isReverse = false){
    var repE1 = e1.properties.rep.votes;
    var demE1 = e1.properties.dem.votes;
    var repE2 = e2.properties.rep.votes;
    var demE2 = e2.properties.dem.votes;

    if (candidate == 0 && isReverse){
        return (demE1 - repE1) - (demE2 - repE2)
    } else if (candidate == 1 && isReverse){
        return (repE1 - demE1) - (repE2 - demE2)
    } else if (candidate == 1){
        return (demE2 - repE2) - (demE1 - repE1);
    } else if (candidate == 0){
        return (repE2 - demE2) - (repE1 - demE1);
    }
}

var functionForCompare = comparisonFunction2

var districtSelector = new districtSelector.DistrictSelector(getVotesInDistrict)
var precinctSelector = new precinctSelector.PrecinctSelector(findBorderOutPrecincts, getVotesInDistrict, findBorderInPrecincts, functionForCompare)
var districtNormalizer = new districtNormalizer.DistrictNormalizer(getDistricts, findBorderOutPrecincts, movePrecintToDistrict, getVotesInDistrict, findBorderInPrecincts, findDistrictToMovePrecinct, functionForCompare)

function findBorderOutPrecincts(data, district){
    var precinctsInThisDistrict = data.filter(function(entry){
        return entry.properties.uscong_dis == district;
    });
    var precinctIds = precinctsInThisDistrict.map(function(entry){
        return Number(entry.properties.entryId);
    });
    var precinctsInOtherDistrict = data.filter(function(entry){
        if (entry.properties.uscong_dis == district) return false;
        var isBorder = false;
        entry.properties.neighbours.forEach(function(neighbour){
            if (precinctIds.indexOf(neighbour) > -1) {
                isBorder = true;
                return;
            }
            if (isBorder && !checkConnectivity(data,neighbour)){
                isBorder =  false
            }
        })
        return isBorder;
    })
    return precinctsInOtherDistrict;
};

function findDistrictCenter(data,district){
    var filteredFeatures = data.filter(function(entry){
        return entry.properties.uscong_dis == district;
    }).map(function(entry){
        return turf.point(entry.center.coordinates);
    })
    var features = turf.featureCollection(filteredFeatures)
    //var features = {type:'FeatureCollection', 'features':filteredFeatures}
    var center = turf.center(features);
    console.log('District center is '+JSON.stringify(center))
    return {center:center,features: filteredFeatures}
}

function findRadius(data){
    var center = data.center;
    var features = data.features;
    var distance = 0.0;
    var options = {units: 'kilometers'};
    features.forEach(function(feature){
        var tempDistance = turf.distance(center, feature, options);
        if (tempDistance > distance) distance = tempDistance;
    })
    console.log(distance);
    
}

function specificCheck(data, neighbour, district){
    return true;
    // find center of district
    // find actual precinc that is in the centr
    // check if there is path from this to any precincts in district

    var dataForCalculation = findDistrictCenter(data,district)
    // find district radius
    var radius = findRadius(dataForCalculation, data[neighbour])
    // is this neighbour with the smaller distance distance from center - return true

    // for all enighbours check the distance to all 
    if (data[neighbour].properties.neighbours.length < 4) return true;
    else{
        var count = 0
        var total = data[neighbour].properties.neighbours.length;
        data[neighbour].properties.neighbours.forEach(function(entry){
            if (data[entry].properties.uscong_dis == district){
                count ++;
            }
        })
        return count > 1
    }
}

function findBorderInPrecincts(data, district){
    var precinctsInThisDistrict = data.filter(function(entry){
        return entry.properties.uscong_dis == district;
    });
    
    var borderPrecinctsInThisDistrict = precinctsInThisDistrict.filter(function(entry){
        var isBorder = false;
        entry.properties.neighbours.forEach(function(neighbour){
            if (data[neighbour].properties.uscong_dis != district){
                isBorder = true;
            }
            if (isBorder && !checkConnectivity(data,neighbour)){
                isBorder =  false
            }
        })
        return isBorder;
    })
    return borderPrecinctsInThisDistrict;
};


function getVotesInDistrict(data, district){
    var votesDistrict = data.filter(function(entry){
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


function getDistricts(data){
    var districts = data.map(function(entry){
        return entry.properties.uscong_dis; 
    }).filter(function(elem, index, self){
        return self.indexOf(elem) == index;
    })
    return districts
}

function checkForWinner(data, candidate, tempResults){
    var districts = getDistricts(data)
    var found = 0;
    var other = 1;
    if (candidate == 1) other = 0
    
    districts.forEach(function(entry){
        var dataTemp = getVotesInDistrict(data,entry);
        if (dataTemp.votes[candidate] > dataTemp.votes[other]) found ++;
        if (tempResults) {
            tempResults[entry] = dataTemp.votes[candidate] - dataTemp.votes[other];
        }
        else found --
    });
    if (found > 0) return true;
    return false
}
function findShortestPathToPrecinct(thisPrecinct, otherPrecinct, data){
    // will return precincts on the path
}

function greedyAlgorithms(data, desiredCandidate){
    isFound = false
    numIterations = 1
    maxNumOfIterations = 2
    printData(data)
    while (numIterations < maxNumOfIterations || isFound){
        var district = selectDistrict(data, desiredCandidate)
        var precinct = selectPrecinct(data, district, desiredCandidate)
        if (precinct.properties.uscong_dis == district){
            console.log('here '+district)
            district = findDistrictToMovePrecinct(data, precinct)
        }
        console.log("Move to  " + district + ' district.')
        movePrecintToDistrict(data, precinct, district)
        if (numIterations%10 == 0)
            normalizePartitions(data, desiredCandidate)
        isFound = checkForWinner(data, desiredCandidate);
        printData(data);
        numIterations ++;
    }
    return data;
}


function algorithm(json, desiredCandidate, filename){
    var data = json.features;
    var found = false;
    var i = 0;
    var maxIterations = 100
    while(!found){
        data = greedyAlgorithms1(data, desiredCandidate)
        normalizePartitions(data, desiredCandidate);
        printData(data);
        found = checkForWinner(data, desiredCandidate) || i>maxIterations;
        i++;
    }
    json.features = data;
    var foundPartition = JSON.stringify(json);
    fs.writeFileSync(filename, foundPartition, function(err) {
        if(err) {
            return console.log(err);
        }
    });
    return json;
}

function isStuck(prevResults,curResults){
    var curKeys = Object.keys(curResults)
    var prevKeys = Object.keys(prevResults)
    var diff = 0
    if (curKeys.length == 0 || prevKeys.length == 0 || curKeys.length != prevKeys.length) return false;
    curKeys.forEach(function(entry){
        diff += Math.abs(prevResults[entry] - curResults[entry])
    })
    if (diff < 100){
        console.log('Algorithm is stuck')
        return true
    }
    return false
    
}

function greedyAlgorithms1(data, desiredCandidate){
    isFound = false
    numIterations = 1
    maxNumOfIterations = 10000
    printData(data)
    // precinctsInDistrict(data)
    var oldDistrict;
    var count = 0;
    var isStop = isFound || numIterations >= maxNumOfIterations
    var prevResults = {};
    var curResults = {};
    while (!isStop){
        count++;
        var district = selectDistrict(data, desiredCandidate)
        var precinct = selectPrecinct(data, district, desiredCandidate)
        if (!precinct){
            prevResults = JSON.parse(JSON.stringify(curResults))
            normalizeDistrict(data, desiredCandidate, oldDistrict, count)
            count = 0;
            isFound = true
        }
        else{
            if (precinct.properties.uscong_dis == district){
                district = findDistrictToMovePrecinct(data, precinct)
            }
            console.log("Move to  " + district + ' district.')
            movePrecintToDistrict(data, precinct, district);
            if (oldDistrict && oldDistrict != district){
                normalizeDistrict(data, desiredCandidate, oldDistrict, count)
                count = 0;
                isFound = true
            }
    
        }
        
        isFound = checkForWinner(data, desiredCandidate, curResults);
        console.log(isFound + ' iter '+numIterations)
        printData(data);
        numIterations ++;
        oldDistrict = district;
        isStop = isFound || numIterations > maxNumOfIterations || isStuck(prevResults,curResults)
    }
    
    return data;
}

function findDistrictToMovePrecinct(data, precinct){
    if (!precinct) return;
    var districts = []
    var oldDistrict = precinct.properties.uscong_dis;
    precinct.properties.neighbours.forEach(function(neighbour){
        var tempDistrict = data[neighbour].properties.uscong_dis;
        if (tempDistrict && tempDistrict != oldDistrict){
            if (districts.indexOf(tempDistrict) == -1)
                districts.push(tempDistrict)
        }
    })
    console.log(districts)
    return districts[Math.floor(Math.random() * districts.length)]
}

function movePrecintToDistrict(data, precinct, district){
    data = data.map(function(entry){
        if (entry.properties.entryId == precinct.properties.entryId){
            entry.properties.uscong_dis = String(district);
        }
        return entry
    });
    
    return data
}

function checkConnectivity(data, id){
    var precinct = data[id];
    var index
    var elems = {}
    data.filter(function(entry){
        return entry.properties.uscong_dis == precinct.properties.uscong_dis;
    }).forEach(function(entry){
        elems[entry.properties.entryId] = {entryId: entry.properties.entryId, neighbours: entry.properties.neighbours, foundPath: false}
    })
    return findPath(elems, id, data);
}

function findPath(elems, id, otherId){
    var array = [];
    array.push(id);
    while(array.length > 0){
        var tempId = array.pop();
        elems[tempId].foundPath = true;
        elems[tempId].neighbours.forEach(function(entryId){
            if (elems[entryId] && !elems[entryId].foundPath) array.push(entryId);
        })
    }
    var arrayElems = Object.keys(elems).reduce(function(arrayElems,key){
        if (elems[key]) arrayElems.push(elems[key])
        return arrayElems;
    },[])
    
    var found = arrayElems.filter(function(entry){
        if (entry.foundPath) return true;
    })
    // console.log('Check if CC is broken '+(arrayElems.length - found.length) + ' precincts are disconnected');
    return found.length == arrayElems.length;
}


function printData(data){
    var districts = getDistricts(data)
    var str;
    districts.forEach(function(district){
        var temp = getVotesInDistrict(data, district);
        if (temp.votes[0]> temp.votes[1]) str = 'REP won'
        else str = 'DEM won'
        console.log('District '+district + ' has '+temp.total +' votes and '+temp.precincts +
            ' precincts, ' + temp.votes[0] +' for republican candidate and '+temp.votes[1] + ' for democrat candidate. '
            +str + ' with diff: '+(temp.votes[0] - temp.votes[1]))
    })
}
function selectDistrict(data, desiredCandidate){
    var district = districtSelector.select(data, desiredCandidate)
    console.log("Selected district " + district)
    return district;
}

function selectPrecinct(data, district, desiredCandidate){
    var precinct = precinctSelector.selectPrecinct(data, district, desiredCandidate)
    if (precinct){
        console.log("Selected precinct " + precinct.properties.NAME10 + ' is in district ' + precinct.properties.uscong_dis)
        console.log("Rep votes " + precinct.properties.rep.votes + ' and dem votes ' + precinct.properties.dem.votes + ' and total of '+ precinct.properties.total +', diff: '+(precinct.properties.rep.votes-precinct.properties.dem.votes))
    }
    return precinct;
}

function normalizePartitions(data, candidate){
    normalizeAll(data);
    if (districtNormalizer){
        districtNormalizer.normalizeDistrict(data, candidate)
    }
}

function normalizeAll(data){
    data = data.map(function(precinct){
        var district = legalDistrictForPrecinct(data, precinct);
        precinct.properties.uscong_dis = district;
    })
    return data;
}

function legalDistrictForPrecinct(data, precinct){
    var thisDistrict = precinct.properties.uscong_dis;
    var otherLegalDistricts = [];
    precinct.properties.neighbours.forEach(function(neighbour){
        var tempDistrict = data[neighbour].properties.uscong_dis;
        if (otherLegalDistricts.indexOf(tempDistrict) == -1){
            otherLegalDistricts.push(tempDistrict)
        }
    })
    if (otherLegalDistricts.indexOf(thisDistrict) > -1) return thisDistrict;
    else return otherLegalDistricts[Math.floor(Math.random() * otherLegalDistricts.length)]
}

function normalizeDistrict(data,candidate, district, countTotal){
    var count = 0;
    console.log('NormalizeDistrict')
    while (count< countTotal){
        var borderPrecincts = findBorderInPrecincts(data, district)
        // borderPrecincts = borderPrecincts.sort(function(e1,e2){
        //     comparisonFunction(e1,e2, candidate, true)
        // })
        borderPrecincts = borderPrecincts.filter(function(entry){
            return entry.properties.dem.votes>entry.properties.rep.votes
        })
        var precinct = borderPrecincts[Math.floor(Math.random() * borderPrecincts.length)];
        if (!precinct){
            return;
        }
        var otherDistrict = findDistrictToMovePrecinct(data, precinct)
        console.log("Normalization: Selected precinct " + precinct.properties.NAME10 + ' is in district ' + precinct.properties.uscong_dis + " Move to  " + otherDistrict + ' district.')
        console.log("Rep votes " + precinct.properties.rep.votes + ' and dem votes ' + precinct.properties.dem.votes + ' and total of '+ precinct.properties.total +', diff: '+(precinct.properties.rep.votes-precinct.properties.dem.votes))
        movePrecintToDistrict(data, precinct, otherDistrict)
        count ++;
    }
}



module.exports.greedyAlgorithm = algorithm
module.exports.setGeoJson = setGeoJson