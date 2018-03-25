var ops = require('./DataStructureOps');

function District(data, candidate, isWinning, name ,gap, isAssignInitial=false){
	this.isAssignInitial = isAssignInitial;
    this.isWinning = isWinning;
    this.name = name;
	this.potentialPrecinctsToAdd = [];
    this.votes = new Array(2).fill(0);
    this.totalVotes = 0
	this.precincts = []
	this.gap = gap;
	this.candidate = candidate;

	this.isConnectionBroken = function(){
		let result = this.isBreaksConnection();
		if (result) console.log('District broken '+this.name)
	}

	this.isBreaksConnection = function(precinctId){
		let allAccesed = this.precincts.map(function(entry){
			if (entry == precinctId) return {name:entry, accesable: 0};
			else return {name:entry, accesable: -1};
		})
		let stack = [allAccesed.filter(function(entry){
			return entry.accesable != 0;
		}).map(function(entry){
			return entry.name	
		})[0]];
		let district = this.name;
		let that = this;
		while(stack.length > 0){
			current = stack.pop()
			allAccesed = allAccesed.map(function(entry){
				if (entry.name == current){
					entry.accesable = 1;
				}
				return entry;
			});
			if (data[current]){
				data[current].properties.neighbours.forEach(function(neighbour){
					var index = that.precincts.indexOf(neighbour)
					if (index > -1 && stack.indexOf(neighbour) == -1 ){
						var temp = allAccesed.filter(function(entry){
							return entry.accesable == -1 && entry.name == neighbour ;
						})
						if (temp.length > 0)
							stack.push(neighbour)
					}
				});
			}
		}
		let notAccessed = allAccesed.filter(function(entry){
			return entry.accesable == -1
		})
		if (notAccessed.length > 0) {			
			return true
		}
		return false
	}


    this.calculateVotes = function(precinct, isAdded = true){
		if (isAdded){
	        this.totalVotes += precinct.properties.total;
    	    this.votes[0] += precinct.properties.rep.votes || 0;
			this.votes[1] += precinct.properties.dem.votes || 0;
		} else {
			this.totalVotes -= precinct.properties.total;
    	    this.votes[0] -= precinct.properties.rep.votes || 0;
			this.votes[1] -= precinct.properties.dem.votes || 0;
		}
	};
	
	this.isWinner = function(){
		return this.votes[this.candidate] > this.votes[(this.candidate+1)%2] + this.gap;
	}


    this.print = function(){
        var percentDem = (((this.votes[1] * 1.0 )/this.totalVotes)*100).toFixed(2);
        var percentRep = (((this.votes[0] * 1.0 )/this.totalVotes)*100).toFixed(2);
        var str = 'District ' + this.name + ' winning '+this.isWinning+', Total Votes: '+this.totalVotes+', Votes for Republican: '+this.votes[0] + 
        '(' + percentRep + '%), Votes for Democrat: '+ this.votes[0] + '(' + percentDem + '%).'
        if (this.votes[1] > this.votes[0]){
            str += 'Democrat won ' + (this.votes[1] - this.votes[0]) + ' more votes.'
        }
        else{
            str += 'Republican won ' + (this.votes[0] - this.votes[1]) + ' more votes.'
        }
        str += 'Number of precicncts: '+this.precincts.length;
        console.log(str);
    }

    this.addPrecinct = function(precinct){
		if (this.precincts.indexOf(precinct) > -1) {
			console.log('Precinct '+precinct +' is already in district '+this.name);
			return;
		}
		this.precincts.push(precinct);
        var precicntObj = data.filter(function(entry){
            return parseInt(entry.properties.entryId) == precinct;
		})
        if (precicntObj.length > 0){
			this.calculateVotes(precicntObj[0])
			data[precicntObj[0].properties.entryId].properties.new_district = this.name;
			this.calculateNeighbours(data)
		}
		else{
			console.log('Can not get precinct object for '+precinct)
		}
		
	};
	

    this.calculateNeighbours = function(data){
		if (this.precincts.length == 0) return;
		this.potentialPrecinctsToAdd = []
        var that = this;
        this.precincts.forEach(function(entry){
            data[entry].properties.neighbours.forEach(function(neighbour){
                if ((data[neighbour].properties.new_district == 'None' && !that.isAssignInitial) || (data[neighbour].properties.new_district != data[entry].properties.new_district && that.isAssignInitial)){
                    if (that.potentialPrecinctsToAdd.indexOf(neighbour) == -1){
						that.potentialPrecinctsToAdd.push(neighbour)
					}
						
                }
            })
		});
    };

	this.getAllPotentialPrecinctsSorted = function(metric){
		var precincts = this.potentialPrecinctsToAdd;
        if (precincts.length == 0) return;
		return precincts.sort(metric(this, data));
	}

    this.findPrecinctToAdd = function(metric, probability){
		this.calculateNeighbours(data)
		var bestMatchPrecincts = this.getAllPotentialPrecinctsSorted(metric(this, data))
		if (!bestMatchPrecincts || bestMatchPrecincts.length == 0) return;
        if (Math.random() > probability){
            return bestMatchPrecincts[Math.floor(Math.random()*bestMatchPrecincts.length)]
        }
        else{
            return bestMatchPrecincts[0];
        }
	};
	
	this.removePrecinct = function(precinct){
		if (this.precincts.indexOf(precinct) == -1){
			console.log('Precinct '+precinct+' can not be removed from district ' +this.name);
			return;
		}		
		this.precincts = this.precincts.filter(function(entry){
			return entry !== precinct;
		})
		this.calculateVotes(data[precinct], false);
		this.calculateNeighbours(data)
	};

	this.getAllPotentialPrecinctsToRemoveSorted = function(metric){
		let border = []
		let that = this;
		this.precincts.forEach(function(precinct){
			if (border.indexOf(precinct) == -1)
				data[precinct].properties.neighbours.forEach(function(neighbour){
				if (data[neighbour].properties.new_district != that.name){
					border.push(precinct)
				}
			})
		})
		return border.sort(metric(this, data));
	}
	

	if (data && isAssignInitial){
		var that = this;
		data.filter(function(entry){
			if (entry.properties.new_district == that.name){
				that.precincts.push(parseInt(entry.properties.entryId));
				that.calculateVotes(entry)
				that.calculateNeighbours(data);
			}
		})
		this.isConnectionBroken();
	}
	if (data && !isAssignInitial){
		this.potentialPrecinctsToAdd = [];
        if (this.precincts.length == 0){
            var districtName = this.name
            this.potentialPrecinctsToAdd = data.filter(function(precinct){
                return precinct.properties['uscong_dis'] == districtName;
            }).map(function(entry){
                return parseInt(entry.properties.entryId);
			});
            return;
        }
	}
}
module.exports.District = District