import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';


class ResultsList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {selectedOption:0, openStatus:[]}
    }

	handleOptionChange(event) {
		this.setState({ selectedOption: Number(event.target.value)});
		this.props.passToButton(Number(event.target.value))
	}

	toggleDescription(index){
		console.log('toggle')
		let state = this.state;
		var oldVal = state.openStatus[index];
		if (!oldVal) state.openStatus.map((entry)=>false);
		state.openStatus[index] = !oldVal;
		this.setState(state);
	}

	componentWillReceiveProps(nextProps){
		if (this.state.openStatus.length == 0){
			if (nextProps.data.length > 0){
				let state = this.state 
				nextProps.data.forEach(function(e){
					state.openStatus.push(false);
				});
				this.setState(state);
			}
		}
	}
	  
	getLi(elem, index){
		console.log(this.state.selectedOption)
		let description = elem.description;
		let descHtml = (<span>{description}</span>)
		if (!this.state.openStatus[elem.id]){
			description = description.slice(0, Math.min(50, description.length))
			descHtml = (<span>
							{description}
							<a tabIndex={0} onClick={this.toggleDescription.bind(this, elem.id)}>...</a>
						</span>)
		}
		return (
			<div key={elem.id}>
				<div className="row">
					<div className="col-2 border-left">
            			<input type="radio" value={elem.id} checked={this.state.selectedOption === Number(elem.id)} 
						 onChange={this.handleOptionChange.bind(this)}/>
          			</div>
					<div className="col-2 border-left">{elem.id}</div>
					<div className="col-8 border-left border-right">{descHtml}</div>
				</div>
			</div>
		)
	}

	render () {
		var that = this;
		console.log(this.props.data)
		let lis = this.props.data.map((elem, index)=>that.getLi(elem, index))
		return (
    		<div className='grid px-5' style={{position:'relative', overflow:'auto', height:'auto'}}>
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