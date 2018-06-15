import React from 'react';
import {render} from 'react-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import PropTypes from 'prop-types';

const columns = [{
		dataField: 'district',
		text: 'District',
		sort: true,
		class: '90px'
	}, {
		dataField: 'total',
		text: 'Total Votes'
  	}, {		
		dataField: 'precincts',
	  	text: 'Number precincts'
	}, {
		dataField: 'dem',
		text: 'Votes for Democrat Candidate'
  	}, {
		dataField: 'dem_percent',
		text: 'Votes for Democrat Candidate (%)'
	}, {
		dataField: 'rep',
		text: 'Votes for Republican Candidate'
	}, {
		dataField: 'rep_percent',
		text: 'Votes for Republican Candidate (%)'
}];

class ResultsTable extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
            districts: [],
        }
    }

	componentWillReceiveProps(nextProps){
		let districts = [];
		nextProps.districts.forEach(function(district){
			let districtObj = nextProps.json.features.filter(function(entry){
				return entry.properties.uscong_dis == district
			}).map(function(entry){
				return {dem:entry.properties.dem.votes || 0, rep:entry.properties.rep.votes || 0, total:entry.properties.total}
			}).reduce(function(e1,e2){
				return {precincts: e1.precincts + 1, district:parseInt(district), dem:e1.dem+e2.dem, rep:e1.rep+e2.rep, total:e1.total+e2.total};
			}, {precincts:0,dem:0,rep:0, total:0, district:parseInt(district)})
			districtObj.dem_percent = ((1.0 * districtObj.dem)/districtObj.total * 100).toFixed(2);
			districtObj.rep_percent = ((1.0 * districtObj.rep)/districtObj.total * 100).toFixed(2);
			districtObj.id = district;
			districts.push(districtObj)
		});
		let state = this.state;
		state.districts = districts;
		this.setState(state)
	}

	rowStyle(row, rowIdx){
		return (row.rep > row.dem) ? { backgroundColor: 'rgba(255,0,0,0.7)' } : { backgroundColor: 'rgba(0,0,255,0.7)' };
	}

	render () {
		return (
    		<div className='smaller m-3'>
        		<BootstrapTable keyField='id' data={ this.state.districts } columns={ columns } rowStyle={this.rowStyle} hover={true}/>
        	</div>
    	);
  	}
}

ResultsTable.propTypes = {
	json: PropTypes.object,
	districts: PropTypes.array
}


export default ResultsTable;