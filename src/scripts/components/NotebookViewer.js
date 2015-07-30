import React from 'react';
import Canvas from './drawing/Canvas';

class NotebookViewer extends React.Component {
  render() {
    return (
        <Canvas
          className='canvas view'
          activePicture={this.props.activePicture}
          drawingMode='normal'
          shapes={this.props.shapes} />
    );
  }
}

export default NotebookViewer;
