import React from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';

const colors = ['#ADFF2F', '#00FFFF', '#FF00FF', '#00CED1', '#4B0082', '#00FF00'];

class Map extends React.Component {

	componentDidMount() {
		mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiRy1GV1FoNCJ9.yUPu7qwD_Eqf_gKNzDrrCQ';
		this.map = new mapboxgl.Map({
			container: this.mapContainer,
			style: "mapbox://styles/mapbox/outdoors-v9",
			center: [-106, 34],
			zoom: 5
		});
	}

	updateMapLayers(districts) {
		let that = this;
		let i = 0;
		districts.forEach(function (entry) {
			if (that.map.getLayer('district' + entry + 'new')) that.map.remove('district' + entry + 'new');
			that.map.addLayer({
				'id': 'district' + entry + 'new',
				'type': 'fill',
				'source': 'district' + entry + 'new',

				'layout': {
					'visibility': 'none'
				},
				'paint': {
					'fill-color': colors[i],
					'fill-opacity': 1.0
				}
			});
			i++;
		});		
	}
	createMapLayers(districts) {
		let that = this;
		let i = 0;
		districts.forEach(function (entry) {
			that.map.addSource("district" + entry + 'new', {
				"type": "geojson",
				"data": '/getGeoJsonDistrict?district=' + entry + '&type=new'
			}),
			that.map.addSource("district" + entry + 'old', {
				"type": "geojson",
				"data": '/getGeoJsonDistrict?district=' + entry + '&type=old'
			})
		})
		districts.forEach(function (entry) {
			
			that.map.addLayer({
				'id': 'district' + entry +'old',
				'type': 'fill',
				'source': 'district' + entry + 'old',

				'layout': {
					'visibility': 'visible'
				},
				'paint': {
					'fill-color': colors[i],
					'fill-opacity': 1.0
				}
			});
			that.map.addLayer({
				'id': 'district' + entry + 'new',
				'type': 'fill',
				'source': 'district' + entry + 'new',

				'layout': {
					'visibility': 'none'
				},
				'paint': {
					'fill-color': colors[i],
					'fill-opacity': 1.0
				}
			});
			i++;
		});		
	}
	applyMapLayer(is_initial) {
		let that = this;
		var type = 'old';
		let otherType = 'new';
		
		if (!is_initial) {
			type = 'new';
			otherType = 'old';
		}
		this.props.districts.forEach(function (entry) {
			that.map.setLayoutProperty('district' + entry + type, 'visibility', 'visible');
			that.map.setLayoutProperty('district' + entry + otherType, 'visibility', 'none');
		});		
	}


	componentWillReceiveProps(nextProps) {
		let that = this;
		if (this.props.districts.length == 0){
			this.createMapLayers(nextProps.districts)
			return
		}
		else if (this.props.is_initial != nextProps.is_initial){
			this.applyMapLayer(nextProps.is_initial)
		}
		if (nextProps.isToUpdate == true){
			this.updateMapLayers(nextProps.districts)
		}
	}

	componentWillUnmount() {
		this.map.remove();
	}

	render() {
		var style = {
			height: '400px',
			width: 'calc(100% - 4em)',
			margin: '1rem'
		};
		return <div style={style} ref={el => this.mapContainer = el} />;
	}
}

Map.defaultProps = {
	isToUpdate: false
  };

Map.propTypes = {
	is_initial: PropTypes.bool,
	districts: PropTypes.array,
	isToUpdate: PropTypes.bool
}

export default Map;