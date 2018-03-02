function RandomWinningAddPrecinctSelector(findBorderOutPrecincts, getVotesInDistrict){
    this.name = 'Random winning precinct selector selects random precinct from ones where the direred candidate won to add';
    this.selectPrecinct = function(data, district, candidate){
        var potentialPrecinctsToAdd = this.findPotentialPrecinctsToAdd(data, district, candidate)
        var bestToAdd = potentialPrecinctsToAdd[0]
        return bestToAdd;
    };

    this.findPotentialPrecinctsToAdd = function(data, district, candidate){
        var precinctsInOtherDistrict = findBorderOutPrecincts(data,district)
        var votesStructure = getVotesInDistrict(data, district)
        var isRepWin = votesStructure.votes[0]>votesStructure.votes[1]
        precinctsInOtherDistrict = precinctsInOtherDistrict.filter(function(entry){
            if (candidate == 1){
                var sortVal = (e2.properties.dem.votes/e2.properties.total) - (e1.properties.dem.votes/e1.properties.total)
                if (isRepWin) return sortVal
                return -sortVal;
            } else {
                var sortVal = (e2.properties.rep.votes/e2.properties.total) - (e1.properties.rep.votes/e1.properties.total);
                if (!isRepWin) return sortVal
                return -sortVal;
            }

        })
        return precinctsInOtherDistrict;
    }


}

module.exports.PrecinctSelector = RandomWinningAddPrecinctSelector