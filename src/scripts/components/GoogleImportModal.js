import React from 'react';
import _ from 'lodash';
import Modal from './Modal';
import GoogleSheetsApi from '../api/GoogleSheetsApi';

class GoogleImportModal extends React.Component {

  render() {
    return (
      <Modal title='Import Google Spreadsheet...'
        submitTitle='Import'
        isShowing={this.props.isShowing}
        onSubmit={this.handleGoogleImport.bind(this)}
        onClose={this.props.onClose}>

          <input ref="inputGoogleUrl" type="text" placeholder="Enter Spreadsheet ID"
            defaultValue={this.props.activePicture.googleSpreadsheetId}
            onKeyDown={this.handleGoogleUrlKeyDown.bind(this)} />

      </Modal>
    );
  }

  handleGoogleImport() {
    let googApi = new GoogleSheetsApi();
    let googleSpreadsheetId = React.findDOMNode(this.refs.inputGoogleUrl).value;
    if (_.isEmpty(googleSpreadsheetId)) {
        this.context.actions.picture.setGoogleSpreadsheetId(
          this.props.activePicture, null);
        this.props.onClose();
    } else {
      googApi.loadSpreadsheet(googleSpreadsheetId).then(varMap => {
        this.context.actions.picture.setGoogleSpreadsheetId(
          this.props.activePicture, googleSpreadsheetId);
        this.context.actions.picture.importVariables(this.props.activePicture, varMap);
        this.props.onClose();
      }).catch( err => {
        console.log('Error loading spreadheet', err);
        this.props.onClose();
      });
    }
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
  activePicture: React.PropTypes.object.isRequired
};

export default GoogleImportModal;
