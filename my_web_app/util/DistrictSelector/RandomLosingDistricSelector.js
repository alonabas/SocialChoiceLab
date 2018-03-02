function RandomLosingDistricSelector(getVotesInDistrict){
    this.name = 'Random Losing distric selector selects random district from those where desired party is losing'

    this.select = function(data, desiredCandidate){
        var districts = data.map(function(entry){
            return entry.properties.uscong_dis; 
        })
        districts = districts.filter(function(elem, index, self){
            var votesData = getVotesInDistrict(data, elem);
            return self.indexOf(elem) == index && votesData.votes[desiredCandidate]<votesData.votes[(desiredCandidate+1)%2];
        })
        return districts[Math.floor(Math.random() * districts.length)]
    }
}
module.exports.DistrictSelector = RandomLosingDistricSelector