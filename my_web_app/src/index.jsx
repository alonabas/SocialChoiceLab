import React from 'react';
import {render} from 'react-dom';

import Header from './components/Header.jsx'
import Map from './components/Map.jsx'
import ResultsTable from './components/ResultsTable.jsx'
import ResultsList from './components/ResultsList.jsx';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './index.css';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
			is_initial: true,
			new_json: {},
			list_runs:[],
            old_json: {},
			districts: [],
			changedPrecints:'',
			isToUpdate: false,
			selectedResultId:-1,
			fetchedResultId:-1,
			showAdditional: false
        }
    }

	featchAndUpdate(query, callback) {
		console.log('fetch called')
		let id = this.state.selectedResultId;
		if (id !== -1) query = query+'?id='+id;
		return fetch(query).then((response) => response.json()).then((responseJson) => {
			let state = this.state;
			console.log('Got response')
			if (responseJson.old) state.old_json = responseJson.old;
			if (responseJson.new_json) state.new_json = responseJson.new_json;
			if (responseJson.title) {
				state.title = responseJson.title;
				document.title = responseJson.title;
			}
			let jsonRecieved = responseJson.new_json || responseJson.old
			state.districts = jsonRecieved.features.map(function(entry){
				return entry.properties.uscong_dis; 
			}).filter(function(elem, index, self){
				return self.indexOf(elem) == index;
			})

			state.isToUpdate = true;
			if (responseJson.new_json){
				let count = 0;
				state.new_json.features.forEach(function(entry){
					let corresponding = state.old_json.features[entry.properties.entryId]
					if (corresponding.properties.uscong_dis != entry.properties.uscong_dis){
						count ++ ;
					}
				})
				state.changedPrecints = 'Precincts that changed their district '+count + ' from '+state.new_json.features.length+'.';
			}
			console.log('HEEEE')
			
			if (callback) callback(state, this)
			this.setState(state)
      })
      .catch((error) => {
        console.error(error);
      });
	}

	fetchList(query) {
		return fetch("getListOfResults").then((response) => response.json()).then((responseJson) => {
			let state = this.state;
			console.log('Got response')
			state.list_runs = responseJson;
			state.selectedResultId = 0;
			this.setState(state)
      })
      .catch((error) => {
        console.error(error);
      });
	}

	showAdditional(val){
		let state = this.state;
		state.showAdditional = !state.showAdditional;
		this.setState(state);
	}

    componentDidMount() {
		this.featchAndUpdate('getJson')
		this.fetchList()
	}

	
	updateState(event){
		let val = event.target.getAttribute('data-elem');
		var state = this.state;
		if (val == 'initial'){
			state.is_initial = true;
			this.setState(state)
			return;
		}
		this.featchAndUpdate('getJson', function(state, that ){
			state.is_initial = false;
			state.fetchedResultId = that.state.selectedResultId;
		}.bind(this))
	}

	updateSelectedResult(resultId){
		let state = this.state;
		state.selectedResultId = resultId;
		this.setState(state);
	}
    render () {
		let json = this.state.new_json;
		if (this.state.is_initial){
			json = this.state.old_json;
		}
		let top = 240;
		if (this.state.showAdditional){
			top = 290
		}
        return (
            <div>
                <Header title={this.state.title} is_initial={this.state.is_initial} handler={this.updateState.bind(this)} additional={this.state.changedPrecints}
					selectedResult={this.state.selectedResultId} fetchedResult={this.state.fetchedResultId} showAdditional={this.state.showAdditional} 
					funcToShowAdditional={this.showAdditional.bind(this)}/>
				<span style={{top:top+'px', position:'relative'}}>
				<ResultsList data={this.state.list_runs} passToButton={this.updateSelectedResult.bind(this)}/>
                <Map is_initial={this.state.is_initial} districts={this.state.districts} isToUpdate={this.state.isToUpdate} resultId={this.state.fetchedResultId}/>
                <ResultsTable districts={this.state.districts} json={json}/>
				</span>
            </div>
        );
    }
}

render(<App/>, document.getElementById('app'));