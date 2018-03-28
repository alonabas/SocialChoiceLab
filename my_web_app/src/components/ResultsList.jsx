import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';


class ResultsList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {selectedOption:0}
    }

	handleOptionChange(event) {
		this.setState({ selectedOption: Number(event.target.value)});
		this.props.passToButton(Number(event.target.value))
	}
	  
	getLi(elem, index){
		console.log(this.state.selectedOption)
		return (
			<li key={elem.id}>
				<div className="row">
					<div className="col-2">
            			<input type="radio" value={elem.id} checked={this.state.selectedOption === Number(elem.id)} 
						 onChange={this.handleOptionChange.bind(this)}/>
          			</div>
					<div className="col-2">{elem.id}</div>
					<div className="col-8">{elem.description}</div>
				</div>
			</li>
		)
	}

	render () {
		var that = this;
		console.log(this.props.data)
		let lis = this.props.data.map((elem, index)=>that.getLi(elem, index))
		return (
    		<div className='grid' style={{top:'240px', position:'relative'}}>
        		{lis}
        	</div>
    	);
  	}
}

ResultsList.propTypes = {
	data: PropTypes.array,
	passToButton: PropTypes.func.isRequired
}


export default ResultsList;