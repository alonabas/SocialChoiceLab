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
        this.state ={
            new_json: {},
            old_json: {},
            districts: [],
        }
    }

    componentDidMount() {
        return fetch('getJson').then((response) => response.json()).then((responseJson) => {
            console.log(responseJson)
            let state = this.state;
			state.old_json = responseJson.old;
			state.new_json = responseJson.new;
            state.districts = responseJson.old.features.map(function(entry){
                return entry.properties.uscong_dis; 
            }).filter(function(elem, index, self){
                return self.indexOf(elem) == index;
			})
			responseJson.new_json
            this.setState(state)
      })
      .catch((error) => {
        console.error(error);
      });
    }

    render () {
        return (
            <div>
                <Header/>
                <Map isHide={false} districts={this.state.districts}/>
                <ResultsTable districts={this.state.districts} json={this.state.new_json}/>
            </div>
        );
    }
}

render(<App/>, document.getElementById('app'));