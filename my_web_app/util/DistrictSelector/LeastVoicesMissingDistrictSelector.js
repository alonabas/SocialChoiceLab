function LeastVoicesMissingDistrictSelector(getVotesInDistrict){
    this.name = 'Least Voices missing district selector will select district that has minimal number required voices'

    this.select = function(data, desiredCandidate){
        var districts = data.map(function(entry){
            return entry.properties.uscong_dis; 
        }).filter(function(elem, index, self){
            var votesData = getVotesInDistrict(data, elem);
            return self.indexOf(elem) == index && votesData.votes[desiredCandidate]<votesData.votes[(desiredCandidate+1)%2];
        })
        districts = districts.sort(function(e1,e2){
            var votesData1 = getVotesInDistrict(data, e1);
            var votesData2 = getVotesInDistrict(data, e2);
            var tempe1 = votesData1.votes[0] - votesData2.votes[1];
            var tempe2 = votesData2.votes[0] - votesData1.votes[1]
            if (desiredCandidate == 0){
                return tempe1 - tempe2;
            }
            else {
                return tempe2 - tempe1;
            }

        })
        var best = districts[0]
        if (Math.random() > 0.7){
            best = districts[Math.floor(Math.random() * districts.length)]
        }

        return best
    }
}
module.exports.DistrictSelector = LeastVoicesMissingDistrictSelector