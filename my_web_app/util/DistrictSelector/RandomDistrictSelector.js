function RandomDistrictSelector(getVotesInDistrict){
    this.name = 'Random distric selector selects random district'

    this.select = function(data, desiredCandidate){
        var districts = data.map(function(entry){
            return entry.properties.uscong_dis; 
        })
        districts = districts.filter(function(elem, index, self){
            return self.indexOf(elem) == index;
        })
        return districts[Math.floor(Math.random() * districts.length)]
    }
}
module.exports.DistrictSelector = RandomDistrictSelector