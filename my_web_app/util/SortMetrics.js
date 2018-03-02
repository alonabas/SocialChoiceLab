BestPrecinctInExistingDistrict = function(data, precincts, desiredCandidate, district, isWinning){
    var tempPrecincts = precincts.filter(function(precinct){
        if (desiredCandidate == 0) return data[precinct].properties.rep.votes > data[precinct].properties.dem.votes
        else return data[precinct].properties.dem.votes > data[precinct].properties.rep.votes
    })
    if (tempPrecincts.length < 3){
        tempPrecincts = precincts;
    }

    tempPrecincts = tempPrecincts.sort(function(e1,e2){
        var olde1District = data[e1].properties.uscong_dis;
        var olde2District = data[e2].properties.uscong_dis;
        var tempe1 = data[e1].properties.rep.votes - data[e1].properties.dem.votes;
        var tempe2 = data[e2].properties.rep.votes - data[e2].properties.dem.votes;
        if (desiredCandidate == 1){
            tempe1 = -tempe1
            tempe2 = -tempe2
        }
		var result = tempe1-tempe2;
		var resultPart2;

        if (isWinning) result = tempe2-tempe1;
        if (olde1District == olde2District){
            resultPart2 = -1;
        }
        else{
            resultPart2 = 1;
		}
		return result*0.9+resultPart2*0.1;
    });
    return tempPrecincts;
}

BestPrecinct = function(data, precincts, desiredCandidate, district, isWinning, isOnlyGood = false){
    var tempPrecincts = precincts.filter(function(precinct){
        if (desiredCandidate == 0) return data[precinct].properties.rep.votes > data[precinct].properties.dem.votes
        else return data[precinct].properties.dem.votes > data[precinct].properties.rep.votes
    })
    if (tempPrecincts.length < 3){
        tempPrecincts = precincts;
    }

    tempPrecincts = tempPrecincts.sort(function(e1,e2){
        var tempe1 = data[e1].properties.rep.votes - data[e1].properties.dem.votes;
        var tempe2 = data[e2].properties.rep.votes - data[e2].properties.dem.votes;
        if (desiredCandidate == 1){
            tempe1 = -tempe1
            tempe2 = -tempe2
        }
        var result = tempe1-tempe2;
        if (isWinning) result = tempe2-tempe1;
        return result;
    });
	// printSortResults(data, tempPrecincts, desiredCandidate)
	if (isOnlyGood){
		tempPrecincts = tempPrecincts.filter(function(entry){
			var tempe1 = data[entry].properties.rep.votes - data[entry].properties.dem.votes;
        	if (desiredCandidate == 1){
            	tempe1 = -tempe1
        	}
        	if (isWinning) tempe1 = -tempe1;
        	return tempe1>0;
		})
	}
    return tempPrecincts;
}



ExistingDistrict = function(data, precincts, desiredCandidate, district, isWinning){
    var tempPrecincts = precincts.filter(function(precinct){
        return data[precinct].properties.uscong_dis == district;
    })
    tempPrecincts = tempPrecincts.sort(function(e1,e2){
        var olde1District = data[e1].properties.uscong_dis;
        var olde2District = data[e2].properties.uscong_dis;
        var tempe1 = data[e1].properties.rep.votes - data[e1].properties.dem.votes;
        var tempe2 = data[e2].properties.rep.votes - data[e2].properties.dem.votes;
        if (desiredCandidate == 1){
            tempe1 = -tempe1
            tempe2 = -tempe2
        }
        var result = tempe1-tempe2;
        if (isWinning) result = tempe2-tempe1;
        if (olde1District == olde2District){
            return result;
        }
        else{
            if (olde1District == district){
                return result
            }
            else{
                return -result;
            }
        }
    });
    // printSortResults(data, tempPrecincts, desiredCandidate)
    return tempPrecincts;
}

function printSortResults(data, precincts,desiredCandidate){
    precincts.forEach(function(entry){
        var voicesDiff = data[entry].properties.rep.votes - data[entry].properties.dem.votes;
        if (desiredCandidate == 0){
            console.log('District before '+data[entry].properties.uscong_dis +' , diff in voices '+ voicesDiff + ' to REP')
        }
        else{
            voicesDiff = -voicesDiff;
            console.log('District before '+data[entry].properties.uscong_dis +' , diff in voices '+ voicesDiff + ' to DEM')
        }
    })

}

module.exports.BestPrecinctInExistingDistrict = BestPrecinctInExistingDistrict
module.exports.ExistingDistrict = ExistingDistrict
module.exports.BestPrecinct = BestPrecinct
