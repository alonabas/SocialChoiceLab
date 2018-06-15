import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';

class ResultsList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {selectedOption:0, openStatus:[]}
    }

	handleOptionChange(event) {
		this.setState({ selectedOption: Number(event.target.value)});
		this.props.passToButton(Number(event.target.value))
	}

	openFullDescription(index){
		let state = this.state;
		state.openStatus.map((entry)=>(entry.open=false));
		state.openStatus[index].open = true;
		this.setState(state);
	}

	componentDidMount(){
		if (this.props.data.length > 0){
			let state = this.state 
			this.props.data.forEach(function(e){
				state.openStatus.push({data:e, open:false});
			});
			this.setState(state);
		}
	}

	componentWillReceiveProps(nextProps){
		if (this.state.openStatus.length == 0){
			if (nextProps.data.length > 0){
				let state = this.state 
				nextProps.data.forEach(function(e){
					state.openStatus.push({data:e, open:false});
				});
				this.setState(state);
			}
		}
	}
	  
	getLi(elem, index){
		let description = elem.data.description;
		let descHtml = (<span>{description}</span>)
		let date = 'unknown';
		if (elem.data.date){
			date = dateFormat(new Date(elem.data.date), "dd.mm.yyyy, hh:mm:ss");
		}
		if (!elem.open){
			description = description.slice(0, Math.min(50, description.length))
			descHtml = (<span>
							{description}
							<a title="More information" className="px-2 font-weight-bold" tabIndex={0} onClick={this.openFullDescription.bind(this, elem.data.id)}>...</a>
						</span>)
		}
		return (
			<div key={elem.data.id}>
				<div className="row border-bottom">
					<div className="col-1 border-left">
            			<input type="radio" value={elem.data.id} checked={this.state.selectedOption === Number(elem.data.id)} 
						 onChange={this.handleOptionChange.bind(this)}/>
          			</div>
					<div className="col-3 border-left">{elem.data.id + ' ('+date+')'}</div>
					<div className="col-8 border-left border-right">{descHtml}</div>
				</div>
			</div>
		)
	}

	render () {
		var that = this;
		let lis = this.state.openStatus.map((elem, index)=>that.getLi(elem, index))
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