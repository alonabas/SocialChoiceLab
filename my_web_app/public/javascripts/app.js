var jsonData;
var geoJsonData;
var geoJsonData1;
var randomCube;

function getJson(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getJson', true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            jsonData = xhr.response
            $('#show_graph').removeClass('disabled');
        }
    };
    xhr.send();
};


function getGeoJson(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getGeoJson', true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            geoJsonData = xhr.response
            $('#draw_on_map').removeClass('disabled');
        }
    };
    xhr.send();
};

function drawGraph() {
    var htmlElem = document.getElementById('plot');
    var hoverInfo = document.getElementById('hoverinfo');
    // TODO: get number of districts automatically
    var shapes = []
    for (var i = 1; i<4; i++){
        shapes.push(defineDistrictData(i))
    }
    console.log(jsonData)
    var trace2 = {
        x: [-10,-10,-10,-10,10,10,10,10], 
        y: [-10,-10,10,10,-10,-10,10,10], 
        z: [-10,10,-10,10,-10,10,-10,10], 
        opacity: 0.3,
        color: 'rgb(77,175,74)',
        type: 'mesh3d',
        
    };

    var lines = buildEdges();
    var trace3 = {
        x: lines.map(function(entry){return entry.x}), 
        y: lines.map(function(entry){return entry.y}), 
        z: lines.map(function(entry){return entry.z}),
        mode: 'lines',
        hoverinfo: 'none',
        line: {
            color: 'rgb(50,50,50)',
            width: 0.5
          },
          size: 6,
          symbol: 'dot',
          colorscale: 'Viridis',
          type: 'scatter3d',
    };
    var trace1 = {
        x:jsonData.features.map(function(entry){return entry.plotly.x}), 
        y: jsonData.features.map(function(entry){return entry.plotly.y}), 
        z: jsonData.features.map(function(entry){return entry.plotly.z}),
        text: jsonData.features.map(function(entry){return entry.properties.NAME10}),
        rep: jsonData.features.map(function(entry){return entry.properties.rep.votes}),
        dem: jsonData.features.map(function(entry){return entry.properties.dem.votes}),
        mode: 'markers',
        marker: {
            size: 4,
            line: {
                color: jsonData.features.map(function(entry){
                    if (entry.properties.dem.votes > entry.properties.rep.votes){
                        return 'rgba(217, 217, 217, 0.14)'
                    }
                    else{
                        return 'rgba(217, 0, 0, 0.14)'
                    }
                }),
                width: 0.5
            },
            color: jsonData.features.map(function(entry){
                if (entry.properties.dem.votes > entry.properties.rep.votes){
                    return 'rgba(0, 0, 217, 1.0)'
                }
                else{
                    return 'rgba(217, 0, 0, 1.0)'
                }
             }),
            opacity: 0.9},
        type: 'scatter3d',
        hoverinfo: 'text',
        hoverlabel: {
            bgcolor: jsonData.features.map(function(entry){
                if (entry.properties.dem.votes > entry.properties.rep.votes){
                    return 'rgba(0, 0, 217, 1.0)'
                }
                else{
                    return 'rgba(217, 0, 0, 1.0)'
                }
             }),
        },
    };
    var layout = {
        hovermode:'closest',
        scene:{
        xaxis: {
            showspikes: false,
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            title: '',
            showticklabels: false
          },
          yaxis: {
            showspikes: false,
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            title: '',
            showticklabels: false
          },
          zaxis: {
            showspikes: false,
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            title: '',
            showticklabels: false
          },
        }
    };
    console.log(layout)
    Plotly.newPlot(htmlElem, [trace1, trace3], layout);

}

function buildCubeForData(){
    var count = 10;
    randomCube = [];
    for (var i = -count; i< count; i++){
        for (var j = -count; j< count; j++){
            for (var k = -count; k< count; k++){
                randomCube.push({x:i, y:j,z:k})
            }
        }
    }
    $('#request_data').removeClass('disabled');

}

function defineDistrictData(district){
    var data = {}
    var shape = {}
    shape.type = 'mesh3d'
    shape.xref = 'x'
    shape.yref = 'y'
    shape.zref = 'z'
    shape.opacity = 0.2
    shape.fillColor = 'green'

    var tempRandomCube = randomCube.slice();
    var elem, index;
    var initx = 0, inity = 0, initz = 0;
    if (district == 1) initx = 30
    if (district == 2) inity = 30
    if (district == 3) initz = 30
    var districtData = jsonData.features.filter(function(entry){
        return entry.properties.uscong_dis == district
    })
    districtData.map(function(entry){
        index = Math.floor(Math.random()*tempRandomCube.length)
        elem = tempRandomCube[index];
        entry.plotly = {}
        entry.plotly.z = initz + elem.z;
        entry.plotly.x = initx + elem.x;
        entry.plotly.y = inity + elem.y;
        tempRandomCube.splice(index, 1);
        return entry;
    }) 
    shape.x0 = initx - 10;
    shape.y0 = inity - 10;
    shape.z0 = initz - 10;
    shape.x1 = initx + 10;
    shape.y1 = inity + 10;
    shape.z1 = initz + 10;
    return shape;

}

function buildEdges(){
    var neightbours = []
    jsonData.features.forEach(function(entry){
        var id = entry.properties.entryId;
        if (entry.properties.neighbours){
            entry.properties.neighbours.forEach(function(neighbour){
                    neightbours.push({x:entry.plotly.x, y:entry.plotly.y,z:entry.plotly.z})
                    neightbours.push({x:jsonData.features[neighbour].plotly.x, y:jsonData.features[neighbour].plotly.y,z:jsonData.features[neighbour].plotly.z})
                    neightbours.push({x:null, y:null, z:null})
                
            })
        }
    })
    return neightbours;
}

buildCubeForData();