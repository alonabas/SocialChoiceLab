function BasicDistrictNormalizer(getDistricts, findBorderOutPrecincts,movePrecintToDistrict, getVotesInDistrict, findBorderInPrecincts, findDistrictToMovePrecinct){
    this.name = 'Basic distric normalizer';


    this.normalizeDistrict = function(data, candidate){
        var districts = getDistricts(data);
        var votesInDistrict = this.getVoteInDistrictRequired(data, districts);
        districts.forEach(function(district, index, structure){
            var votes = getVotesInDistrict(data, district);
            console.log('Votes '+votes.votes + ' in district '+district+ ' during normalizetion')
            while (votes.total > votesInDistrict){
                var potentialPrecincts = findBorderInPrecincts(data, district)
                potentialPrecincts = potentialPrecincts.sort(function(e1,e2){
                    // console.log(e1.properties.dem.votes)
                    // console.log(e1.properties.rep.votes)
                    // console.log(e1.properties.dem.votes/e1.properties.rep.votes)
                    // console.log(e1.properties.rep/e1.properties.dem.votes)
                    var temp1 = Math.max(e1.properties.dem.votes/e1.properties.rep.votes, e1.properties.rep.votes/e1.properties.dem.votes)
                    // console.log(temp1)
                    var temp2 = Math.max(e2.properties.dem.votes/e2.properties.rep.votes, e2.properties.rep.votes/e2.properties.dem.votes)
                    // console.log(temp2)
                    return temp1-temp2
                })
                var curPrecinct = potentialPrecincts[0]
                if (curPrecinct){
                    var newDistrict = findDistrictToMovePrecinct(data, curPrecinct)
                    console.log("Final Normalization: Selected precinct " + curPrecinct.properties.NAME10 + ' is in district ' + curPrecinct.properties.uscong_dis + " Move to  " + newDistrict + ' district.')
                    console.log("Rep votes " + curPrecinct.properties.rep.votes + ' and dem votes ' + curPrecinct.properties.dem.votes + ' and total of '+ curPrecinct.properties.total +', diff: '+(curPrecinct.properties.rep.votes-curPrecinct.properties.dem.votes))
                    movePrecintToDistrict(data, curPrecinct, newDistrict)
                }
                else{
                    return
                }
                votes = getVotesInDistrict(data, district);
            }
        })
    }

    this.getVoteInDistrictRequired = function(data, districts){
        var totalNumberOfVotes = data.map(function(entry){
            return entry.properties.total;
        }).reduce(function(e1,e2){
            return e1+e2;
        },0)
        var votesInDistrict = Math.ceil((totalNumberOfVotes + 100)/districts.length);
        return votesInDistrict;
    }

    this.removeFromDistrict = function(district, data){
       
    };

    this.selectDistrict = function(data, districtVotes){
        var precinctsInThisDistrict = data.filter(function(entry){
            return entry.properties.uscong_dis == district;
        })
        var potentialPrecinctsToAdd = this.findPotentialPrecinctsToAdd(precinctsInThisDistrict, data, district, candidate)
        var bestToAdd = potentialPrecinctsToAdd[0]
        return bestToAdd;
    };

    this.findPotentialPrecinctsToAdd = function(precinctsInThisDistrict, data, district, candidate){
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
            })
            return isBorder;
        })
        precinctsInOtherDistrict = precinctsInOtherDistrict.sort(function(e1,e2){
            if (candidate == 1)
                return e2.properties.dem.votes/e2.properties.total - e1.properties.dem.votes/e1.properties.total
            else 
                return e2.properties.rep.votes/e2.properties.total - e1.properties.rep.votes/e1.properties.total
        })
        return precinctsInOtherDistrict;
    }
}
module.exports.DistrictNormalizer = BasicDistrictNormalizer