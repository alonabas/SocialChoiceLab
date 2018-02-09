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
				'id': 'district' + entry + 'new',
				'type': 'fill',
				'source': 'district' + entry + 'new',

				'layout': {},
				'paint': {
					'fill-color': colors[i],
					'fill-opacity': 1.0
				}
			});
			that.map.addLayer({
				'id': 'district' + entry +'old',
				'type': 'fill',
				'source': 'district' + entry + 'old',

				'layout': {},
				'paint': {
					'fill-color': colors[i],
					'fill-opacity': 1.0
				}
			});
			i++;
		});		
	}

	applyMapLayer(type) {
		let that = this;
		let otherType = 'new';
		if (type == 'new') otherType = 'old'
		this.props.districts.forEach(function (entry) {
			that.map.setLayoutProperty('district' + entry + type, 'visibility', 'visible');
			that.map.setLayoutProperty('district' + entry + otherType, 'visibility', 'none');
		});
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.districts.length == 0){
			this.createMapLayers(nextProps.districts)
		}
		if (this.props.resultType != nextProps.resultType){
			this.applyMapLayer(nextProps.resultType)
		}
	}

	componentWillUnmount() {
		this.map.remove();
	}

	render() {
		var style = {
			height: '400px',
			width: '600px',
			margin: 'auto'
		};
		if (this.props.isHide) {
			style.height = '0px';
			style.width = '0px';
		}
		return <div style={style} ref={el => this.mapContainer = el} />;
	}
}

Map.propTypes = {
	isHide: PropTypes.bool.isRequired,
	resultType: PropTypes.string,
	districts: PropTypes.array
}

export default Map;