function BasicDistrictNormalizer(getDistricts, findBorderOutPrecincts,applyPrecintToDistrict, getVotesInDistrict){
    this.name = 'Basic distric normalizer';


    this.normalizeDistrict = function(data, candidate){
        var districts = getDistricts(data);
        var votesInDistrict = this.getVoteInDistrictRequired(data, districts);
        districts.forEach(function(district, index, structure){
            var votes = getVotesInDistrict(data, district);
            console.log('Votes '+votes.votes + ' in district '+district+ ' during normalizetion')
            while (votes.total < votesInDistrict){
                var potentialPrecincts = findBorderOutPrecincts(data, district)
                var votes = getVotesInDistrict(data, district);
                potentialPrecincts = potentialPrecincts.filter(function(entry){
                    var tempDem = votes.votes[1] + entry.properties.dem.votes;
                    var tempRep = votes.votes[0] + entry.properties.rep.votes;
                    if ((candidate == 0 && votes.votes[0] > votes.votes[1]) || (candidate == 1 && votes.votes[1] > votes.votes[0])){
                        // Do not distroy
                        if (candidate == 0) return tempRep > tempDem
                        else return tempDem > tempRep
                    }
                    return true;
                    // if (candidate == 0 && votes.votes[1] > votes.votes[0])
                    //     return entry.properties.rep.votes > entry.properties.dem.votes
                    // else{
                    //     return entry.properties.rep.votes > entry.properties.dem.votes
                    // }
                })
                // potentialPrecincts = potentialPrecincts.sort(function(e1,e2){
                //     if (Number(e1.properties.uscong_dis) < Number(district.district)) return -1;
                //     if ((candidate == 1 && votes.votes[1] > votes.votes[0]) || (candidate == 0 && votes.votes[0] > votes.votes[1]))
                //         return (e2.properties.dem.votes/e2.properties.total) - (e1.properties.dem.votes/e1.properties.total)
                //     else{
                //         return (e1.properties.dem.votes/e1.properties.total) - (e2.properties.dem.votes/e2.properties.total)
                //     }
                // })
                var curPrecinct = potentialPrecincts[Math.floor(Math.random() * potentialPrecincts.length)]
                console.log('Precict to remove from district '+ curPrecinct.properties.uscong_dis + ' to district '+district)
                console.log('Total votes: '+ curPrecinct.properties.total + ', for democrat: '+curPrecinct.properties.dem.votes+' for republican: '+curPrecinct.properties.rep.votes)
                applyPrecintToDistrict(data, curPrecinct, district);
            }
        })
    }

    this.getVoteInDistrictRequired = function(data, districts){
        var totalNumberOfVotes = data.map(function(entry){
            return entry.properties.total;
        }).reduce(function(e1,e2){
            return e1+e2;
        },0)
        var votesInDistrict = Math.ceil((totalNumberOfVotes - 1000)/districts.length);
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
module.exports.BasicDistrictNormalizer = BasicDistrictNormalizer