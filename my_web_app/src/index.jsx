import React from 'react';
import {render} from 'react-dom';

import Header from './components/Header.jsx'
import Map from './components/Map.jsx'
import ResultsTable from './components/ResultsTable.jsx'
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './index.css';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
			is_initial: true,
            new_json: {},
            old_json: {},
			districts: [],
			changedPrecints:'',
			isToUpdate: false
        }
    }

	featchAndUpdate(query) {
		return fetch(query).then((response) => response.json()).then((responseJson) => {
			let state = this.state;
			console.log('Got response')
			state.old_json = responseJson.old;
			state.new_json = responseJson.new;
			state.title = responseJson.title;
			state.isToUpdate = true;
            state.districts = responseJson.old.features.map(function(entry){
                return entry.properties.uscong_dis; 
            }).filter(function(elem, index, self){
                return self.indexOf(elem) == index;
			})
			let count = 0;
			state.new_json.features.forEach(function(entry){
				let corresponding = state.old_json.features[entry.properties.entryId]
				console.log(corresponding)
				if (corresponding.properties.uscong_dis == entry.properties.uscong_dis){
					count ++ ;
				}
			})
			state.changedPrecints = 'Precincts that changed their district '+count + ' from '+state.new_json.features.length+'.';
			document.title = responseJson.title;
            this.setState(state)
      })
      .catch((error) => {
        console.error(error);
      });
	}

    componentDidMount() {
        return this.featchAndUpdate('getJson')
	}

	rerurnAlgorithm(){
		return this.featchAndUpdate('rerunAlg')
	}
	
	updateState(){
		var state = this.state;
		state.is_initial = !state.is_initial;
		this.setState(state)
	}

    render () {
		let json = this.state.new_json;
		if (this.state.is_initial){
			json = this.state.old_json;
		}
        return (
            <div>
                <Header title={this.state.title} is_initial={this.state.is_initial} handler={this.updateState.bind(this)} additional={this.state.changedPrecints}
					rerurnAlgHandler={this.rerurnAlgorithm.bind(this)}/>
                <Map is_initial={this.state.is_initial} districts={this.state.districts} isToUpdate={this.state.isToUpdate}/>
                <ResultsTable districts={this.state.districts} json={json}/>
            </div>
        );
    }
}

render(<App/>, document.getElementById('app'));