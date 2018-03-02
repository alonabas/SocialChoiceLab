function BestPrecinctSelector(findBorderOutPrecincts, getVotesInDistrict, findBorderInPrecincts){
    this.name = 'Best precinct selector: finds best precinct to add to provided district or to remove from the ditsrict';
    this.selectPrecinct = function(data, district, candidate){
        var potentialPrecinctsToAdd = this.findPotentialPrecinctsToAdd(data, district, candidate)
        console.log(potentialPrecinctsToAdd[0].properties.rep.votes + ' when total is ' +potentialPrecinctsToAdd[0].properties.total)
        var potentialPrecinctsToRemove = this.findPotentialPrecinctsToRemove(data, district, candidate)
        console.log(potentialPrecinctsToRemove[0].properties.rep.votes + ' when total is ' +potentialPrecinctsToRemove[0].properties.total)
        var votesStructure = getVotesInDistrict(data, district)
        var precinctToAdd = this.selectBest(potentialPrecinctsToAdd, votesStructure, 0, candidate)
        var precinctToRemove = this.selectBest(potentialPrecinctsToRemove, votesStructure, 1, candidate)
        var rand = Math.random();
        if (rand > 0.5) {
            if (precinctToRemove)
                return precinctToRemove;
            else return potentialPrecinctsToRemove[Math.floor(Math.random() * potentialPrecinctsToRemove.length)]
        } else {
            if (precinctToAdd)
                return precinctToAdd;
            else return potentialPrecinctsToAdd[Math.floor(Math.random() * potentialPrecinctsToAdd.length)]
        }
    };

    this.selectBest = function(potentialPrecincts, votesStructure, sign, candidate){
        var index = 0;
        var found = false;
        var isGoodBefore = votesStructure.votes[0] > votesStructure.votes[1]
        if (candidate == 1){
            isGoodBefore = votesStructure.votes[1] > votesStructure.votes[0]
        }
        while (!found){
            var precinct  = potentialPrecincts[index];
            var tempRep = votesStructure.votes[0] + precinct.properties.rep.votes;
            var tempDem = votesStructure.votes[1] + precinct.properties.dem.votes;
            if (sign == 1){
                tempRep = votesStructure.votes[0] - precinct.properties.rep.votes;
                tempDem = votesStructure.votes[1] - precinct.properties.dem.votes;
            }
            if (!isGoodBefore) found = true;
            else{
                if (candidate == 0 && tempRep > tempDem) found = true;
                else if (candidate == 1 && tempDem > tempRep) found = true;
            }
            if (index == potentialPrecincts - 1) return null;
            index ++;
            
        }
        return precinct;
    }

    this.findPotentialPrecinctsToAdd = function(data, district, candidate){
        var precinctsInOtherDistrict = findBorderOutPrecincts(data,district)
        var votesStructure = getVotesInDistrict(data, district)
        var isRepWin = votesStructure.votes[0]>votesStructure.votes[1]
        precinctsInOtherDistrict = precinctsInOtherDistrict.sort(function(e1,e2){
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

    this.findPotentialPrecinctsToRemove = function(data, district, candidate){
        var borderPrecinct = findBorderInPrecincts(data,district)
        borderPrecinct = borderPrecinct.sort(function(e1,e2){
            if (candidate == 1)
                return (e2.properties.rep.votes/e2.properties.total) - (e1.properties.rep.votes/e1.properties.total)
            else
                return (e2.properties.dem.votes/e2.properties.total) - (e1.properties.dem.votes/e1.properties.total)
        })
        console.log('precincts to remove '+borderPrecinct.map(function(entry){return entry.properties.entryId}))
        return borderPrecinct;
    }



}

module.exports.PrecinctSelector = BestPrecinctSelector