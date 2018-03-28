import React from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';

const colors = ['#ADFF2F', '#00FFFF', '#FF00FF', '#00CED1', '#4B0082', '#00FF00'];

class Map extends React.Component {

	constructor(props, context){
		super(props, context);
		this.state = ({appliedLayer:''})
	}
	componentDidMount() {
		mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiRy1GV1FoNCJ9.yUPu7qwD_Eqf_gKNzDrrCQ';
		this.map = new mapboxgl.Map({
			container: this.mapContainer,
			style: "mapbox://styles/mapbox/outdoors-v9",
			center: [-106, 34],
			zoom: 5
		});
	}



	tryCreateInitialLayers(districts, resultId){
		let that = this;
		let i = 0;
		let name = 'new-'+resultId;
		let query = '&type=new&resultId='+resultId
		if (resultId == -1) {
			name = 'old'
			query = '&type=old'
		}
		districts.forEach(function (entry) {
			if (!that.map.getLayer("district" + entry + name)) {
				that.map.addSource("district" + entry + name, {
					"type": "geojson",
					"data": '/getGeoJsonDistrict?district=' + entry + query
				})
			}
		})
		districts.forEach(function (entry) {
			if (!that.map.getLayer("district" + entry + name)) {
				that.map.addLayer({
					'id': 'district' + entry + name,
					'type': 'fill',
					'source': 'district' + entry + name,

					'layout': {
						'visibility': 'none'
					},
					'paint': {
						'fill-color': colors[i],
						'fill-opacity': 1.0
					}
				});
				i++;
			}
		});		
	}
	applyMapLayer(districts, resultId) {
		let name = 'new-'+resultId;
		if (resultId == -1){
			name = 'old'
		}
		var that = this;
		districts.forEach(function (entry) {
			if (that.map.getLayer("district" + entry + that.state.appliedLayer)) {
				that.map.setLayoutProperty('district' + entry + that.state.appliedLayer, 'visibility', 'none');
			}
			that.map.setLayoutProperty('district' + entry + name, 'visibility', 'visible');
			that.setState({appliedLayer:name})
			// 
		});		
	}


	componentWillReceiveProps(nextProps) {
		let that = this;
		if (JSON.stringify(nextProps) == JSON.stringify(this.props)) return;
		if (nextProps.isToUpdate == true && nextProps.is_initial){
			this.tryCreateInitialLayers(nextProps.districts, -1)
			this.applyMapLayer(nextProps.districts,-1);
			return;
		}
		else if( nextProps.isToUpdate == true && nextProps.resultId > -1){
			this.tryCreateInitialLayers(nextProps.districts, nextProps.resultId)
			this.applyMapLayer(nextProps.districts,nextProps.resultId);
			return;
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
	isToUpdate: PropTypes.bool,
	resultId: PropTypes.number
}

export default Map;