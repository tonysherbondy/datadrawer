import React from 'react';
import Modal from './Modal';
import GoogleSheetsApi from '../api/GoogleSheetsApi';

class GoogleImportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      googleSpreadsheetId: ''
    };
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

      </Modal>
    );
  }

  handleIdChange() {
    let googleSpreadsheetId = React.findDOMNode(this.refs.inputGoogleUrl).value;
    this.setState({googleSpreadsheetId});
  }

  handleGoogleImport() {
    let googApi = new GoogleSheetsApi();
    googApi.loadSpreadsheet(this.state.googleSpreadsheetId).then(varMap => {
      this.context.actions.picture.importVariables(this.props.activePicture, varMap);
      this.props.onClose();
    }).catch( err => {
      console.log('Error loading spreadheet', err);
      this.props.onClose();
    });

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
