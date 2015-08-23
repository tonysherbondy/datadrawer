import React from 'react';
import Canvas from './drawing/Canvas';
import GoogleSheetsApi from '../api/GoogleSheetsApi';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';

class NotebookViewer extends React.Component {

  render() {
    return (
      <div className='notebook-viewer-container'>
        <Canvas
          className='canvas view'
          activePicture={this.props.activePicture}
          drawingMode='normal'
          shapes={this.getShapes()} />
        <div
          onClick={this.handleEditClick.bind(this)}
          className="return-to-edit-popover">
          Edit
        </div>
      </div>
    );
  }

  // TODO - make it so that the other shapes are not computed in the component above
  // us so that we are not redoing the calculation here. We need to do this because
  // we want to ignore current instruction for this route
  getShapes() {
    let {activePicture, notebook, variableValues} = this.props;
    let pictures = notebook.pictures.valueSeq().toArray();
    return (new NotebookPictureCompiler({variableValues, pictures}))
      .getShapesForPicture(activePicture);
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
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  }),
  router: React.PropTypes.func.isRequired
};

NotebookViewer.propTypes = {
  notebook: React.PropTypes.object.isRequired,
  variableValues: React.PropTypes.object.isRequired,
  activePicture: React.PropTypes.object.isRequired
};

export default NotebookViewer;
