var jsonData;
var geoJsonData;

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


function otherMapRender(){
    $('#vis-network').css('display','none');
    $('#map').css('display','block');

    mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiRy1GV1FoNCJ9.yUPu7qwD_Eqf_gKNzDrrCQ';
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/outdoors-v9",
        center: [-106, 34],
        zoom: 4
    });
    
    map.on('data', function() {
        map.addSource("rep", {
            "type": "geojson",
            "data": '/getGeoJsonRep'
            })

        map.addSource("dem", {
            "type": "geojson",
            "data": '/getGeoJsonDem'
        })
        
        map.addLayer({
            'id': 'rep',
            'type': 'fill',
            'source': 'rep',
            
            'layout': {},
            'paint': {
                'fill-color': '#FF5733',
                'fill-opacity': 0.8
            }
        });

        map.addLayer({
            'id': 'dem',
            'type': 'fill',
            'source': 'dem',
            
            'layout': {},
            'paint': {
                'fill-color': '#336EFF',
                'fill-opacity': 0.8
            }
        });
    });

}


function calulateDistrictWinners(){
    var table = $('<table>',{class:'table'})
    var numberDistricts = 3;
    var trHead = $('<tr>');
    trHead.append($('<th>',{scope:'row',html:'District'}))
    trHead.append($('<th>',{scope:'row',html:'Republican votes'}))
    trHead.append($('<th>',{scope:'row',html:'Democrate votes'}))
    trHead.append($('<th>',{scope:'row',html:'Total votes'}))
    var thead = $('<thead>')
    thead.append(trHead)
    table.append(thead)
    for(var i = 1; i<numberDistricts + 1 ;i++){
        var result = getWinnerForDistrict(i);
        var color = result.rep<result.dem ? 'bg-primary' : 'bg-danger'
        var tr = $('<tr>',{class:color});
        var td = $('<td>')
        td.append(i)
        tr.append(td);
        td = $('<td>')
        td.append(result.rep)
        tr.append(td);
        td = $('<td>')
        td.append(result.dem)
        tr.append(td);
        td = $('<td>')
        td.append(result.total)
        tr.append(td);
        table.append(tr)
    }
    $('#result').append(table)
}

function getWinnerForDistrict(district){
    return jsonData.features.filter(function(entry){
        return entry.properties.uscong_dis == district
    }).map(function(entry){
        return {dem:entry.properties.dem.votes || 0, rep:entry.properties.rep.votes || 0, total:entry.properties.total}
    }).reduce(function(e1,e2){
        return {dem:e1.dem+e2.dem, rep:e1.rep+e2.rep, total:e1.total+e2.total};
    }, {dem:0,rep:0, total:0})    
}
    
