import React from 'react';
import _ from 'lodash';
import Modal from './Modal';
import GoogleSheetsApi from '../api/GoogleSheetsApi';
import Papa from 'papaparse';
import classNames from 'classnames';

class ImportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isGoogle: true
    };
  }

  render() {
    let input = () => {
      if (this.state.isGoogle) {
        return (
          <input ref="inputGoogleUrl" type="text" placeholder="Enter Spreadsheet ID"
            defaultValue={this.props.activePicture.googleSpreadsheetId}
            onKeyDown={this.handleGoogleUrlKeyDown.bind(this)} />
        );
      } else {
        return (
          <input type='file' onChange={this.handleFileUpload.bind(this)} />
        );
      }
    };

    return (
      <Modal title='Import from...'
        submitTitle='Import'
        isShowing={this.props.isShowing}
        onSubmit={this.handleImport.bind(this)}
        onClose={this.props.onClose}>

        <div>
          <a onClick={this.setGoogle.bind(this)}
             className={classNames('btn', 'pill', {active: this.state.isGoogle})}>
            Google Spreadsheet
          </a>
          <a onClick={this.setCsv.bind(this)}
             className={classNames('btn', 'pill', {active: !this.state.isGoogle})}>
            CSV File
          </a>
        </div>

        {input()}

      </Modal>
    );
  }

  setCsv() {
    this.setState({isGoogle: false});
  }

  setGoogle() {
    this.setState({isGoogle: true});
  }

  handleFileUpload(e) {
    console.log('UPLOAD CSV...');
    let file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,

      complete: (results, f) => {
        console.log('parsed', f);
        // currently assuming columns are keyed by first row
        var rowMap = Object.create(null);
        // papaparse makes sure all elements have all keys, even
        // if vals are empty
        for (let row of results.data) {
          for (let key of Object.keys(row)) {
            // value is an array of row values
            let mRow = rowMap[key];
            if (mRow) {
              mRow.push(row[key]);
            } else {
              rowMap[key] = [row[key]];
            }
          }
        }
        this.setState({fileRowMap: rowMap});
      },

      error: (error, f) => {
        console.log('parse error: ', f, error);
      }
    });
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

  handleImport() {
    if (this.state.isGoogle) {
      this.handleGoogleImport();
    } else if (this.state.fileRowMap) {
      this.context.actions.picture.importVariables(this.props.activePicture, this.state.fileRowMap);
      this.props.onClose();
    }
  }

  handleGoogleUrlKeyDown(evt) {
    evt.stopPropagation();
  }
}

ImportModal.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  })
};

ImportModal.propTypes = {
  isShowing: React.PropTypes.bool,
  onClose: React.PropTypes.func.isRequired,
  activePicture: React.PropTypes.object.isRequired
};

export default ImportModal;
