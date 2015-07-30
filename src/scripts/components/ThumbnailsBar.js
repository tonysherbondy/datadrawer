import React from 'react';
import classNames from 'classnames';

import Picture from '../models/Picture';
import PictureActions from '../actions/PictureActions';
import Canvas from './drawing/Canvas';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';

export default class ThumbnailsBar extends React.Component {

  getThumbnailsBar() {
    let getThumbnailForPicture = (picture) => {

      let {activePicture, pictureForPictureTool, pictures, variableValues} = this.props;
      let isActivePicture = picture.id === activePicture.id;
      let isPictureForPictureTool = pictureForPictureTool &&
        picture.id === pictureForPictureTool.id;

      // We make our own picture compiler because none of these images will care about
      // the current instruction
      let pictureCompiler = new NotebookPictureCompiler({variableValues, pictures});
      let shapes = pictureCompiler.getShapesForPicture(picture);

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
            activePicture={picture}
            drawingMode={'normal'}
            shapes={shapes} />
        </a>);
    };
    return (
      <div>
        {this.props.pictures.map(getThumbnailForPicture)}
        <a href='#' onClick={this.handleAddNewPicture.bind(this)}>
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

  handleAddNewPicture(evt) {
    let picture = new Picture();
    PictureActions.addNewPicture(picture);
    if (this.props.onThumbnailClick) {
      this.props.onThumbnailClick(picture);
    }
    evt.preventDefault();
  }

  handleThumbnailClick(picture, evt) {
    if (this.props.onThumbnailClick) {
      this.props.onThumbnailClick(picture);
    }
    evt.preventDefault();
  }
}

ThumbnailsBar.propTypes = {
  pictures: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Picture)).isRequired,
  variableValues: React.PropTypes.object.isRequired,
  activePicture: React.PropTypes.instanceOf(Picture).isRequired,
  pictureForPictureTool: React.PropTypes.instanceOf(Picture)
};
