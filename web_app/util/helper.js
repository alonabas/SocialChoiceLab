var path = require('path');
var fs = require('fs');


module.exports.readJsonFileSync = function(filepath, encoding){
    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}
module.exports.fixDistricts = function(data){
	data.features.map(function (entry) {
		let temp;
		if (Array.isArray(entry.properties.all) && entry.properties.all.length > 0) {
			temp = entry.properties.all[0].district
		}
		else {
			temp = entry.properties.all.district
		}
		if (temp) {
			entry.properties.uscong_dis = temp.toString();
		}
		else {
			// console.log('No district for precinct ' + entry.properties.name);
			// console.log(entry.properties.all)
			// console.log(entry.properties.uscong_dis)
	
		}
		return temp
	});
}



