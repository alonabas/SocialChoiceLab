function TestMetric(metricReq){
	
	this.execute = function(){
		let precincts = [0,1,2,3]
		let districts = [this.buildDistrict(1,2,4,true, 0), this.buildDistrict(2,3,4,false, 0), this.buildDistrict(3,3,1,false, 0), this.buildDistrict(4,4,2,true, 0)]
		let data = [this.buildEntry(0,2,3), this.buildEntry(1,1,4), this.buildEntry(2,2,2), this.buildEntry(3,5,1)]
		let testData = {candidateToWin: 0, data:data, precincts: precincts, districts: districts};
		let resultsPrecinctForDistrict1 = [3,2,0,1]
		let resultsPrecinctForDistrict2 = [1,0,2,3]
		let resultsPrecinctForDistrict3 = [1,0,2,3]
		let resultsPrecinctForDistrict4 = [1,0,2,3]
		let resultsDistricts = [3,4,2,1]
		this.runTest(testData, [resultsPrecinctForDistrict1, resultsPrecinctForDistrict2, resultsPrecinctForDistrict3,resultsPrecinctForDistrict4], resultsDistricts)
	}
	
	this.runTest = function(testData, results, resultsDistricts){
		testData.districts.forEach(function(district, index){
			var metricToUse = new metricReq.Metric(0, testData.candidateToWin);
			var result = testData.precincts.sort(metricToUse.metricPrecinct(district, testData.data));
			var status = JSON.stringify(result) == JSON.stringify(results[index])
			if (!status){
				var str= 'ERRORS in metric, test '+index+' failed\n';
			str += 'Metric returns: '+result+'\n';
			str += 'Expected result: '+results[index] +'\n';
			str += 'Candidate: '+ testData.candidateToWin+', district: '+district.print()+', precincts: \n'
			testData.data.forEach(function(entry){
				str +='\t'+ entry.print()+'\n';
			})
			throw 'Error: '+str
			}
		})
		var metricToUse = new metricReq.Metric(0, testData.candidateToWin);
		var result = testData.districts.sort(metricToUse.metricDistrict()).map((entry)=> entry.name);
		var status = JSON.stringify(result) == JSON.stringify(resultsDistricts)
		if (!status){
			var str= 'ERRORS in metric, test failed\n';
			str += 'Metric returns: '+result+'\n';
			str += 'Expected result: '+resultsDistricts +'\n';
			str += 'Candidate: '+ testData.candidateToWin+', districts: \n';
			testData.districts.forEach(function(entry){
				str +='\t'+ entry.print()+'\n';
				
			})
			throw 'Error: '+str
		}

	}
	
	this.buildDistrict =function(name, rep,dem, isWinning, candidate){
		var district ={
			votes: [rep,dem],
			isWinning: isWinning,
			name: name,
			isWinner: function(){
				if (candidate == 0) return rep>dem
				else return dem>rep
			},
			print: function(){
				 return 'Distric '+name+' winning:'+isWinning+', rep:'+rep+', dem:'+dem+', is already winner '+this.isWinner();
			}
		}
		return district;
	}

	this.buildEntry = function(i, rep, dem){
		let precinct = {properties: {
			entryId: i,
			rep:{
				votes:rep
			},
			dem: {
				votes: dem
			}
		},
		print: function(){
			return 'Precinct '+i+', rep:'+rep+', dem:'+dem
		}}
		return precinct;
	}

}
module.exports.TestMetric = TestMetric