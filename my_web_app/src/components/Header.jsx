import React from 'react';
import {render} from 'react-dom';
import {ButtonToolbar,Button} from 'react-bootstrap';


class Header extends React.Component {
  render () {
    return (
        <div className="jumbotron">
            <h1 className="text-center">
                This is a Title
            </h1>
            <ButtonToolbar>
                    <Button bsStyle="primary" className="ml-1 mr-1">
                        Initial Results
                    </Button>
                    <Button bsStyle="primary" className="ml-1 mr-1">
                        New Results
                    </Button>
                    <Button bsStyle="primary" className="ml-1 mr-1">
                        Additional Information
                    </Button>
                    <Button bsStyle="primary" className="ml-1 mr-1">
                        Hide All
                    </Button>
                </ButtonToolbar>
        </div>
    );
  }
}

export default Header;