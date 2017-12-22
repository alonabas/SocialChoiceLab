// var jsonData;
// var geoJsonData;
// var randomCube;

// //in main
// function getJson(callback) {
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', 'getJson', true);
//     xhr.responseType = 'json';
//     xhr.onload = function () {
//         var status = xhr.status;
//         if (status === 200) {
//             jsonData = xhr.response
//             $('#show_graph').removeClass('disabled');
//         }
//     };
//     xhr.send();
// };


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

function smartGraphBuilder(){
    var stack = [];
    stack.push(jsonData.features[0]);
    var x =0, y = 0, z = 0;
    while(stack.length > 0){
        var elem = stack.pop();
        elem.plotly = {}
        elem.plotly.x = x;
        elem.plotly.y = y;
        elem.plotly.z = z;
        var len = elem.properties.neighbours.length;
        elem.properties.neighbours.forEach(function(neighbour){
            stack.push()

        });

    }
}

function renderMap(){
    Plotly.d3.json('/getGeoJsonRep', function(redjson) {
    // Plotly.d3.json('/getDistricts', function(redjson) {
    Plotly.d3.json('/getGeoJsonDem', function(bluejson) {
        
            Plotly.newPlot("map", [{
              type: 'scattermapbox',
              lat: [46],
              lon: [-74]
            }], {
              title: "New Mexico districts",
              height: 600,
              width: 600,
              mapbox: {
                center: {
                  lat: 34,
                  lon: -106
                },
                style: 'light',
                zoom: 4.8,
                layers: [
                  {
                    sourcetype: 'geojson',
                    source: bluejson,
                    type: 'fill',
                    color: 'rgba(30,44,255,0.8)'
                  },   
                  {
                    sourcetype: 'geojson',
                    source: redjson,
                    type: 'fill',
                    color: 'rgba(245,42,69,0.8)'
                  },        
                ]
              }
            }, {
              mapboxAccessToken: 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiRy1GV1FoNCJ9.yUPu7qwD_Eqf_gKNzDrrCQ'
            });
              
            
        });
    });
// });
}

function oneMoreRender(){
    Plotly.d3.json('/getGeoJson', function(bluejson) {
        
            Plotly.newPlot("map", [{
              type: 'scattermapbox',
              lat: [46],
              lon: [-74]
            }], {
              title: "Florida Counties",
              height: 600,
              width: 600,
              mapbox: {
                center: {
                  lat: 34,
                  lon: -106
                },
                style: 'light',
                zoom: 4.8,
                layers: [
                  {
                    sourcetype: 'geojson',
                    source: bluejson,
                    type: 'fill',
                    color: 'rgba(40,0,113,0.8)'
                  },        
                ]
              }
            }, {
              mapboxAccessToken: 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiRy1GV1FoNCJ9.yUPu7qwD_Eqf_gKNzDrrCQ'
            });
              
        });
}

// in Main
// function otherMapRender(){
//     /*console.log(geoJsonData)
//     var temp = geoJsonData.features.filter(function(entry){
//         return entry.properties.uscong_dis == 1;
//     })
//     var allTemp = {};
//     allTemp.type = "FeatureCollection"
//     allTemp.features = temp
//     */
//     mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiRy1GV1FoNCJ9.yUPu7qwD_Eqf_gKNzDrrCQ';
//     var map = new mapboxgl.Map({
//         container: "map",
//         style: "mapbox://styles/mapbox/outdoors-v9",
//         center: [-106, 34],
//         zoom: 4
//     });
    
//     map.on('data', function() {
//         map.addSource("national-park", {
//             "type": "geojson",
//             "data": '/getGeoJsonRep'
//             })
        
//         map.addLayer({
//             'id': 'maine',
//             'type': 'fill',
//             'source': 'national-park',
            
//             'layout': {},
//             'paint': {
//                 'fill-color': '#088',
//                 'fill-opacity': 0.8
//             }
//         });
//     });

// }
function drawCleverGraph() {
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
    recalculateCenters()
    var lines = buildCleverEdges();
    var trace3 = {
        x: lines.map(function(entry){return entry.x}), 
        y: lines.map(function(entry){return entry.y}), 
        mode: 'lines',
        hoverinfo: 'none',
        line: {
            color: 'rgb(50,50,50)',
            width: 0.5
          },
          size: 6,
          symbol: 'dot',
          colorscale: 'Viridis',
          type: 'scatter',
    };
    var trace1 = {
        x:jsonData.features.map(function(entry){return entry.center.coordinates[0]}), 
        y: jsonData.features.map(function(entry){return entry.center.coordinates[1]}), 
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
        type: 'scatter',
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
        
    };
    console.log(layout)
    Plotly.newPlot(htmlElem, [trace1, trace3], layout, {scrollZoom: true});

}

function buildCleverEdges(){
    var neightbours = []
    jsonData.features.forEach(function(entry){
        var id = entry.properties.entryId;
        if (entry.properties.neighbours){
            entry.properties.neighbours.forEach(function(neighbour){
                    neightbours.push({x:entry.center.coordinates[0], y:entry.center.coordinates[1]})
                    neightbours.push({x:jsonData.features[neighbour].center.coordinates[0], y:jsonData.features[neighbour].center.coordinates[1]})
                    neightbours.push({x:null, y:null})
                
            })
        }
    })
    return neightbours;
}

function recalculateCenters(){
    var stack = [];
    var curElem = jsonData.features[0];
    curElem.newCenter = {}
    curElem.newCenter.coordinates = [0,0];
    stack.push(curElem);
    while(stack.length > 0){
        curElem = stack.pop();
        curElem.done = true
        curElem.properties.neighbours.forEach(function(neighbourId){
            var neighbour = jsonData.features[neighbourId];
            if (!neighbour.done){
            var distance = Math.pow(curElem.center.coordinates[0] - neighbour.center.coordinates[0],2) + Math.pow(curElem.center.coordinates[1] - neighbour.center.coordinates[1],2)
            var angle = (curElem.center.coordinates[0] - neighbour.center.coordinates[0])/(curElem.center.coordinates[1] - neighbour.center.coordinates[1])
            neighbour.newCenter = {}
            neighbour.newCenter.coordinates = [curElem.newCenter.coordinates[0] + 5*Math.cos(angle),curElem.newCenter.coordinates[1] + 5*Math.sin(angle)]
            stack.push(neighbour)
            }
        })
    }
}


function buildGraph(){
    $('#map').css('display','none');
    $('#vis-network').css('display','block');
    var nodes = new vis.DataSet(jsonData.features.map(function(entry){
        var isRep  = 0;
        if (!entry.properties.dem.votes) isRep = 1;
        else if (entry.properties.rep.votes && entry.properties.rep.votes>entry.properties.dem.votes) isRep = 1;
        return {id:parseInt(entry.properties.entryId), label: entry.properties.NAME10, group: parseInt(entry.properties.uscong_dis+''+isRep)}
    }));

    var edges = [];
    jsonData.features.forEach(function(feature){
        var neighbours = feature.properties.neighbours.forEach(function(neighbour){
            if (feature.properties.entryId < jsonData.features[neighbour].properties.entryId){
                edges.push({from:parseInt(feature.properties.entryId), to:parseInt(jsonData.features[neighbour].properties.entryId)})
            }
        })

    })
    edges = new vis.DataSet(edges)
    console.log(nodes)
    console.log(edges)
    var container = document.getElementById('vis-network');
    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        layout: {
            improvedLayout:false
        },
        nodes: {
            shape: 'dot',
            size: 20,
            font: {
                size: 15,
                color: '#ffffff'
            },
            borderWidth: 2
        },
        edges: {
            width: 2
        },
        groups: {
            10: {
                color: {background:'red',border:'white'},
                shape: 'diamond'
            },
            20: {
                color: {background:'red',border:'white'},
                shape: 'dot'
            },
            30: {
                color: {background:'red',border:'white'},
                shape: 'star'
            },

            11: {
                color: {background:'blue',border:'white'},
                shape: 'diamond'
            },
            21: {
                color: {background:'blue',border:'white'},
                shape: 'dot'
            },
            31: {
                color: {background:'blue',border:'white'},
                shape: 'star'
            },
            mints: {color:'rgb(0,255,140)'},
            source: {
                color:{border:'white'}
            }
        }
    };

    // initialize your network!
    var network = new vis.Network(container, data, options);
}

function buildGraph1(){
    $('#map').css('display','none');
    $('#vis-network').css('display','block');

    var G = new jsnx.Graph();
    var nodesRep = jsonData.features.filter(function(entry){
        return (entry.properties.rep || !entry.properties.dem) && entry.properties.rep.votes > entry.properties.dem.votes
    }).map(function(entry){
        return entry.properties.entryId
    })
    nodesRep.color = '#FF5733';
    G.addNodesFrom(nodesRep,{color:'#FF5733'});

    var nodesDem = jsonData.features.filter(function(entry){
        return (entry.properties.dem || !entry.properties.rep) && entry.properties.rep.votes <= entry.properties.dem.votes
    }).map(function(entry){
        return entry.properties.entryId
    })
    nodesDem.color = '#336EFF';
    G.addNodesFrom(nodesDem, {color:'#336EFF'});


    var edges = [];
    jsonData.features.forEach(function(feature){
        var neighbours = feature.properties.neighbours.forEach(function(neighbour){
            if (feature.properties.entryId < jsonData.features[neighbour].properties.entryId){
                G.addEdge(feature.properties.entryId,jsonData.features[neighbour].properties.entryId)
            }
        })

    })
    jsnx.draw(G, {
        element: '#vis-network', 
        withLabels: true, 
        nodeStyle: {
            fill: function(d) { 
                return d.data.color; 
            }
        }, 
        labelStyle: {fill: 'white'},
        stickyDrag: true
    });

    // initialize your network!
}

// in main
// function calulateDistrictWinners(){
//     var table = $('<table>',{class:'table'})
//     var numberDistricts = 3;
//     var trHead = $('<tr>');
//     trHead.append($('<th>',{scope:'row',html:'District'}))
//     trHead.append($('<th>',{scope:'row',html:'Republican votes'}))
//     trHead.append($('<th>',{scope:'row',html:'Democrate votes'}))
//     trHead.append($('<th>',{scope:'row',html:'Total votes'}))
//     var thead = $('<thead>')
//     thead.append(trHead)
//     table.append(thead)
//     for(var i = 1; i<numberDistricts + 1 ;i++){
//         var result = getWinnerForDistrict(i);
//         var color = result.rep<result.dem ? 'bg-primary' : 'bg-danger'
//         var tr = $('<tr>',{class:color});
//         var td = $('<td>')
//         td.append(i)
//         tr.append(td);
//         td = $('<td>')
//         td.append(result.rep)
//         tr.append(td);
//         td = $('<td>')
//         td.append(result.dem)
//         tr.append(td);
//         td = $('<td>')
//         td.append(result.total)
//         tr.append(td);
//         table.append(tr)
//     }
//     $('#result').append(table)
// }

// function getWinnerForDistrict(district){
//     return jsonData.features.filter(function(entry){
//         return entry.properties.uscong_dis == district
//     }).map(function(entry){
//         return {dem:entry.properties.dem.votes || 0, rep:entry.properties.rep.votes || 0, total:entry.properties.total}
//     }).reduce(function(e1,e2){
//         return {dem:e1.dem+e2.dem, rep:e1.rep+e2.rep, total:e1.total+e2.total};

//     }, {dem:0,rep:0, total:0})

// }

function testVis(){

    
    var nodes = [
        {id: 0, label: "0", group: 'source'},
        {id: 1, label: "1", group: 'icons'},
        {id: 2, label: "2", group: 'icons'},
        {id: 3, label: "3", group: 'icons'},
        {id: 4, label: "4", group: 'icons'},
        {id: 5, label: "5", group: 'icons'},
        {id: 6, label: "6", group: 'icons'},
        {id: 7, label: "7", group: 'icons'},
        {id: 8, label: "8", group: 'icons'},
        {id: 9, label: "9", group: 'icons'},
        {id: 10, label: "10", group: 'mints'},
        {id: 11, label: "11", group: 'mints'},
        {id: 12, label: "12", group: 'mints'},
        {id: 13, label: "13", group: 'mints'},
        {id: 14, label: "14", group: 'mints'},
        {id: 15, group: 'dotsWithLabel'},
        {id: 16, group: 'dotsWithLabel'},
        {id: 17, group: 'dotsWithLabel'},
        {id: 18, group: 'dotsWithLabel'},
        {id: 19, group: 'dotsWithLabel'},
        {id: 20, label: "diamonds", group: 'diamonds'},
        {id: 21, label: "diamonds", group: 'diamonds'},
        {id: 22, label: "diamonds", group: 'diamonds'},
        {id: 23, label: "diamonds", group: 'diamonds'},
    ];
    var edges = [
        {from: 1, to: 0},
        {from: 2, to: 0},
        {from: 4, to: 3},
        {from: 5, to: 4},
        {from: 4, to: 0},
        {from: 7, to: 6},
        {from: 8, to: 7},
        {from: 7, to: 0},
        {from: 10, to: 9},
        {from: 11, to: 10},
        {from: 10, to: 4},
        {from: 13, to: 12},
        {from: 14, to: 13},
        {from: 13, to: 0},
        {from: 16, to: 15},
        {from: 17, to: 15},
        {from: 15, to: 10},
        {from: 19, to: 18},
        {from: 20, to: 19},
        {from: 19, to: 4},
        {from: 22, to: 21},
        {from: 23, to: 22},
        {from: 23, to: 0},
    ]
    // create a network
    var container = document.getElementById('vis-network');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        nodes: {
            shape: 'dot',
            size: 20,
            font: {
                size: 15,
                color: '#ffffff'
            },
            borderWidth: 2
        },
        edges: {
            width: 2
        },
        groups: {
            diamonds: {
                color: {background:'red',border:'white'},
                shape: 'diamond'
            },
            dotsWithLabel: {
                label: "I'm a dot!",
                shape: 'dot',
                color: 'cyan'
            },
            mints: {color:'rgb(0,255,140)'},
            icons: {
                shape: 'icon',
                icon: {
                    face: 'FontAwesome',
                    code: '\uf0c0',
                    size: 50,
                    color: 'orange'
                }
            },
            source: {
                color:{border:'white'}
            }
        }
    };
    var network = new vis.Network(container, data, options);
}
buildCubeForData();