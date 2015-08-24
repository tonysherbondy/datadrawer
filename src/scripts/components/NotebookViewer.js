import React, { PropTypes } from 'react';
import Canvas from './drawing/Canvas';
import GoogleSheetsApi from '../api/GoogleSheetsApi';
import ShapesCompiler from '../utils/ShapesCompiler';
import VariablesCompiler from '../utils/VariablesCompiler';

@VariablesCompiler()
@ShapesCompiler({ ignoreCurrentInstruction: true })
export default class NotebookViewer {
  static contextTypes = {
    actions: PropTypes.shape({
      picture: PropTypes.object.isRequired
    }),
    router: PropTypes.func.isRequired
  }
  static propTypes = {
    activePicture: PropTypes.object.isRequired,
    shapes: PropTypes.object.isRequired
  }

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
