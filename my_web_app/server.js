var express = require('express');
var pug = require('pug');
var path = require('path');
var fs = require("fs"),
   json;

var app = express();
var config = require('./config/default');

var helper = require('./util/helper');
// var alg = require('./util/algorithmBasic');
// var alg = require('./util/algorithmFromInit');
var alg = require('./util/algorithmImprovment');


function printCounts(data){
  var districts = data.map(function(entry){
      return entry.district; 
  }).filter(function(elem, index, self){
      return self.indexOf(elem) == index;
  })
  districts.forEach(function(district){
      var inDistrict = data.filter(function(element){
          return element.district == district; 
      });
      var votesInDistrict = inDistrict.map(function(entry){
          return entry.votes || 0;
      }).reduce(function(e1,e2){
          return e1+e2;
      },0);
      console.log('District '+district + ' has '+votesInDistrict +' votes and '+inDistrict.length +' districts')
  })
}

function getFileNameForPartitions(){
  var prefix = config.ready_partition_name
  var found = false;
  var folderPath = path.join(__dirname, config.ready_partition_path)
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
  var index = 0;
  var filePath;
  while (!found){
	filePath = path.join(folderPath, config.ready_partition_name + index+'.json')
	console.log(filePath)
	let temp = fs.existsSync(filePath)
    if (temp){
		console.log('exists')
      	index ++;
    }
    else{
      	found = true
    }
  }
  console.log(filePath)
  return filePath;
}
var geoJson
var jsonAfterAlg = json
geoJson = helper.readJsonFileSync(path.join(__dirname, config.ready_geodata_path), 'utf8')
var newJson;
if (config.is_mapping_ready){
  json = helper.readJsonFileSync(path.join(__dirname, config.ready_data_path), 'utf8')
}
else{
  json = helper.buildJsonFile(config.default_path,config.state, config.ready_data_path, config.ready_geodata_path)
}
if (config.is_partition_ready){
  var fileName = config.ready_partition_path+config.ready_partition_name+config.partition_file_to_use+'.json'
  newJson = helper.readJsonFileSync(path.join(__dirname, fileName), 'utf8')
}
else{
	// var found = false;
	var fileName = getFileNameForPartitions();
	// while(!found){
	// 	console.log('! found')
	// 	data = alg.greedyAlgorithm(JSON.parse(JSON.stringify(json)),0, fileName);
	// 	newJson = data.json
	// 	console.log('is found' + data.found)
	// 	found = data.found
	// }
	newJson = alg.greedyAlgorithm(JSON.parse(JSON.stringify(json)),0, fileName);

	  
}

  

  // geoJson.features.map(function(entry, index){
    // entry.properties.uscong_dis = json.features[index].properties.new_district
  // })


  //var temp = helper.readJsonFileSync(path.join(__dirname, config.data_path), 'utf8')
  
  //printCounts(temp.filter(function(elem){return elem.office == 'House'}))

var folderReadyPath = path.join(__dirname, config.ready_partition_path)


app.use('/', express.static(__dirname + '/dist'))

app.use('/node_modules', express.static(__dirname + '/node_modules'))
app.get('/', function(req, res) {
 res.sendFile(path.resolve('src', 'index.html'))
});

app.get('/getJson', function(req, res) {
	var result = {old: json, new: newJson, title:config.state + ' 2016 Elections'};
  	res.send(JSON.stringify(result));
});

var index = 0;
app.get('/rerunAlg', function(req, res) {
	var fileName = getFileNameForPartitions();
	var filePath = path.join(folderReadyPath, config.ready_partition_name + index+'.json')
	console.log('Get file '+filePath)
	newJson = helper.readJsonFileSync(filePath, 'utf8')
	index ++;
	
	var result = {old: json, new: newJson, title:config.state + ' 2016 Elections:new alg run'};
  	res.send(JSON.stringify(result));
	
});

app.get('/getGeoJson', function(req, res) {
  res.send(JSON.stringify(geoJson));  
});

app.get('/getGeoJsonRep', function(req, res) {
  var repFeatures = geoJson.features.filter(function(entry){
    if (!entry.properties.rep) return false;
    else if (!entry.properties.dem) return true;
    return entry.properties.rep.votes > entry.properties.dem.votes
  })
  res.send(JSON.stringify({type:'FeatureCollection', 'features':repFeatures}));  
});

app.get('/getGeoJsonDem', function(req, res) {
  var demFeatures = geoJson.features.filter(function(entry){
    if (!entry.properties.dem) return false;
    else if (!entry.properties.rep) return true;
    return entry.properties.dem.votes >= entry.properties.rep.votes
  })
  res.send(JSON.stringify({type:'FeatureCollection', 'features':demFeatures}));
});

app.get('/getGeoJsonDistrict', function(req, res) {
  var id = req.query.district
  var type = req.query.type;
  if (type == 'new'){
	geoJson.features.map(function(entry, index){
		console.log(newJson)
		entry.properties.uscong_dis = newJson.features[index].properties.uscong_dis
	})
  }
  else{
	geoJson.features.map(function(entry, index){
		entry.properties.uscong_dis = json.features[index].properties.uscong_dis
	})
  }
  var distFeatures = geoJson.features.filter(function(entry){
    return entry.properties.uscong_dis == id;
  })
  console.log(distFeatures.length)
  res.send(JSON.stringify({type:'FeatureCollection', 'features':distFeatures}));
});

app.get('/getALgResult', function(req, res) {
  res.send(JSON.stringify(json));
});


console.log('starting') 
app.listen(3000);