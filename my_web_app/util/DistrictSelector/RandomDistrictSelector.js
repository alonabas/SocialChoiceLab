function RandomDistrictSelector(metric, prob){
    this.name = 'Random distric selector selects random district'

    this.select = function(districts, desiredCandidate){		
        return districts[Math.floor(Math.random() * districts.length)]
    }
}
module.exports.DistrictSelector = RandomDistrictSelector