import React from 'react';
import classNames from 'classnames';

import PictureResult from '../models/PictureResult';
import PictureActions from '../actions/PictureActions';
import Canvas from './drawing/Canvas';

export default class ThumbnailsBar extends React.Component {

  getThumbnailsBar() {
    let getThumbnailForPicture = (picture) => {
      let drawingState = {
        mode: 'normal',
        selectedShapeId: null,
        selectedInstructions: null,
        currentLoopIndex: null,
        editingInstructionId: null,
        activePicture: picture
      };

      let pictureResult = new PictureResult({
        picture: picture,
        allPictures: this.props.pictures
      });
      let isActivePicture =
        picture.id === this.props.activePicture.id;


      let isPictureForPictureTool =
        this.props.pictureForPictureTool
        && picture.id === this.props.pictureForPictureTool.id;

      let className = classNames('picture-thumbnail', {
        'active-picture-thumbnail': isActivePicture,
        'picture-for-picture-tool-thumbnail': isPictureForPictureTool
      });

      return (
        <a key={picture.id}
          href='#'
          onClick={this.handleThumbnailClick.bind(this, picture)}>
          <Canvas
            className={className}
            drawingState={drawingState}
            pictureResult={pictureResult} />
        </a>);
    };
    return (
      <div>
        {this.props.pictures.map(getThumbnailForPicture)}
        <a href='#' onClick={PictureActions.addNewPicture}>
          <div className='picture-thumbnail new-picture-button'>
            New Picture
          </div>
        </a>
      </div>);
  }

  render() {
    return (
      <div className='top-bar'>
        {this.getThumbnailsBar()}
      </div>
    );
  }

  handleThumbnailClick(picture) {
    if (this.props.onThumbnailClick) {
      this.props.onThumbnailClick(picture);
    }
  }
}
