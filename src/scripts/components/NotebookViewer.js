import React from 'react';
import Canvas from './drawing/Canvas';

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

  handleEditClick() {
    let {notebookId, pictureId} = this.context.router.getCurrentParams();
    this.context.router.transitionTo(`/notebook/${notebookId}/picture/${pictureId}/edit`);
  }
}

NotebookViewer.contextTypes = {
  router: React.PropTypes.func.isRequired
};

export default NotebookViewer;
