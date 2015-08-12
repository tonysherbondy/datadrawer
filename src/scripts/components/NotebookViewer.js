import React from 'react';
import Canvas from './drawing/Canvas';
import GoogleSheetsApi from '../api/GoogleSheetsApi';

class NotebookViewer extends React.Component {

  render() {
    return (
      <div className='notebook-viewer-container'>
        <Canvas
          className='canvas view'
          activePicture={this.props.activePicture}
          drawingMode='normal'
          shapes={this.props.shapes} />
        <div
          onClick={this.handleEditClick.bind(this)}
          className="return-to-edit-popover">
          Edit
        </div>
      </div>
    );
  }

  componentWillMount() {
    this.importVariables(this.props.activePicture);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activePicture.googleSpreadsheetId !== this.props.activePicture.googleSpreadsheetId) {
      this.importVariables(nextProps.activePicture);
    }
  }

  importVariables(picture) {
    if (picture.googleSpreadsheetId) {
      let googApi = new GoogleSheetsApi();
      console.log('importing');
      googApi.loadSpreadsheet(picture.googleSpreadsheetId).then(varMap => {
        // Make sure we have come back to the same picture
        if (this.props.activePicture.id === picture.id) {
          this.context.actions.picture.importVariables(picture, varMap);
        }
      }).catch( err => {
        console.log('Error loading spreadheet', err);
      });
    }
  }

  handleEditClick() {
    let {notebookId, pictureId} = this.context.router.getCurrentParams();
    this.context.router.transitionTo(`/notebook/${notebookId}/picture/${pictureId}/edit`);
  }
}

NotebookViewer.contextTypes = {
  router: React.PropTypes.func.isRequired
};

NotebookViewer.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  }),
  router: React.PropTypes.func.isRequired
};

export default NotebookViewer;
