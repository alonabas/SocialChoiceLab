function BasicAdditionPrecinctSelector(findBorderOutPrecincts, getVotesInDistrict, findBorderInPrecincts, functionForCompare){
    this.name = 'Basic Addition precinct selector: finds best precinct to add to provided district';
    this.selectPrecinct = function(data, district, candidate){
        var potentialPrecinctsToAdd = this.findPotentialPrecinctsToAdd(data, district, candidate)
        var bestToAdd = potentialPrecinctsToAdd[0]
        if (Math.random() > 0.7){
            bestToAdd = potentialPrecinctsToAdd[Math.floor(Math.random() * potentialPrecinctsToAdd.length)]
        }
        return bestToAdd;
    };

    this.findPotentialPrecinctsToAdd = function(data, district, candidate){
        
        var precinctsInOtherDistrict = findBorderOutPrecincts(data,district)
        var votesStructure = getVotesInDistrict(data, district)
        var isRepWin = votesStructure.votes[0]>votesStructure.votes[1]
        precinctsInOtherDistrict = precinctsInOtherDistrict.sort(function(e1,e2){
            return functionForCompare(e1,e2, candidate)
        })
        return precinctsInOtherDistrict;
    }


}

module.exports.PrecinctSelector = BasicAdditionPrecinctSelector