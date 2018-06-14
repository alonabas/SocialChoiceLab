import React from 'react';
import {render} from 'react-dom';
import {ButtonToolbar,Button} from 'react-bootstrap';
import PropTypes from 'prop-types';


class Header extends React.Component {
	
	constructor(props){
		super(props);
	}

  	render () {
		let buttonInitial = (<Button bsStyle="primary" onClick={this.props.handler} className="ml-1 mr-1" data-elem='initial' disabled={this.props.is_initial}>
								Initial Results
							</Button>)
							
		let buttonNew = (<Button bsStyle="primary" onClick={this.props.handler} className="ml-1 mr-1" disabled={!this.props.is_initial && this.props.selectedResult === this.props.fetchedResult}>
							Get Results
						</Button>)
    	return (
        	<div className="jumbotron fixed-top">
            	<h1 className="text-center">
                	{this.props.title}
            	</h1>
            	<ButtonToolbar className='center-button-toolbar pt-3'>	
					{buttonInitial}
					{buttonNew}
                	<Button bsStyle="primary" className="ml-1 mr-1" onClick={this.props.funcToShowAdditional} disabled={this.props.is_initial}>
                    	{!this.props.showAdditional &&
							'Show Additional Information'
						}
						{this.props.showAdditional &&
							'Hide Additional Information'
						}
                	</Button>
                </ButtonToolbar>
				{this.props.showAdditional && !this.props.is_initial &&
					<div className="pt-4">
						{this.props.additional}
					</div>
				}
        	</div>
    	);
	}
	  
}

Header.propTypes = {
	is_initial: PropTypes.bool,
	handler: PropTypes.func,
	title: PropTypes.string,
	additional: PropTypes.string,
	selectedResult: PropTypes.number,
	fetchedResult: PropTypes.number,
	showAdditional: PropTypes.bool,
	funcToShowAdditional: PropTypes.func
}

export default Header;