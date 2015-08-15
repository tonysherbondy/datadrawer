import React from 'react';
import _ from 'lodash';
import Modal from './Modal';
import GoogleSheetsApi from '../api/GoogleSheetsApi';
import VariablePill from './VariablePill';

class GoogleImportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      googleSpreadsheetId: '',
      fetchedVariableMap: null
    };
  }

  fetchedVariablesUi() {
    if (!this.state.fetchedVariableMap) {
      return null;
    }

    let variables = _.pairs(this.state.fetchedVariableMap).map(([key]) => {
      return (
        <li className='import-variable-list-item' key={key}>
          <VariablePill picture={this.props.activePicture} variable={{id: 'rando', name: key}} />
        </li>
      );
    });

    return (
      <div className="fetched-variables-ui">
        <h3>Import variables or edit names</h3>
        <ul className="import-variable-list">
          {variables}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <Modal title='Import Google Spreadsheet...'
        submitTitle='Import'
        isShowing={this.props.isShowing}
        onSubmit={this.handleGoogleImport.bind(this)}
        onClose={this.props.onClose}>

          <input ref="inputGoogleUrl" type="text" placeholder="Enter Spreadsheet ID"
            value={this.state.googleSpreadsheetId}
            onChange={this.handleIdChange.bind(this)}
            onKeyDown={this.handleGoogleUrlKeyDown.bind(this)} />

          <a
            onClick={this.handleFetchVariables.bind(this)}
            className="btn">
            Fetch Variables
          </a>

          {this.fetchedVariablesUi()}

      </Modal>
    );
  }

  handleFetchVariables(evt) {
    let googApi = new GoogleSheetsApi();
    googApi.loadSpreadsheet(this.state.googleSpreadsheetId).then(data => {
      this.setState({fetchedVariableMap: data});
    }).catch( err => {
      console.log('Error loading spreadheet', err);
    });
    evt.preventDefault();
  }

  handleIdChange() {
    let googleSpreadsheetId = React.findDOMNode(this.refs.inputGoogleUrl).value;
    this.setState({googleSpreadsheetId});
  }

  handleGoogleImport() {
    this.context.actions.picture.importVariables(this.props.activePicture, this.state.fetchedVariableMap);
    this.props.onClose();
  }

  handleGoogleUrlKeyDown(evt) {
    evt.stopPropagation();
  }
}

GoogleImportModal.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  })
};

GoogleImportModal.propTypes = {
  isShowing: React.PropTypes.bool,
  onClose: React.PropTypes.func.isRequired,
  activePicture: React.PropTypes.object.isRequired,
  notebook: React.PropTypes.object.isRequired
};

export default GoogleImportModal;
