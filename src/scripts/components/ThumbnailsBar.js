import React from 'react';
import classNames from 'classnames';

import Picture from '../models/Picture';
import Canvas from './drawing/Canvas';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';

export default class ThumbnailsBar extends React.Component {

  getThumbnailsBar() {
    let getThumbnailForPicture = (picture) => {

      if (picture === null) {
        return (
          <a
            href='#'
            key={'new-picture-button'}
            onClick={this.handleAddNewPicture.bind(this)}>
              <div className='picture-thumbnail new-picture-button'>
                New Picture
              </div>
          </a>
        );
      }
            //<div className='picture-thumbnail new-picture-button'>

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
        <a
          className='picture-thumbnail-wrapper'
          key={picture.id}
          onClick={this.handleThumbnailClick.bind(this, picture)}>
          <Canvas
            className={className}
            activePicture={picture}
            drawingMode={'normal'}
            shapes={shapes} />
          <i
            onClick={this.handlePreviewPicture.bind(this, picture)}
            className="preview-picture-button fa fa-external-link"></i>
        </a>);
    };
    return this.props.pictures.concat([null]).map(getThumbnailForPicture);
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
    this.context.actions.picture.addNewPicture(picture);
    if (this.props.onThumbnailClick) {
      this.props.onThumbnailClick(picture);
    }
    evt.preventDefault();
  }

  handlePreviewPicture(picture, evt) {
    if (this.props.onPreviewClick) {
      this.props.onPreviewClick(picture);
    }
    evt.stopPropagation();
    evt.preventDefault();
  }

  handleThumbnailClick(picture, evt) {
    if (this.props.onThumbnailClick) {
      this.props.onThumbnailClick(picture);
    }
    evt.preventDefault();
  }
}

ThumbnailsBar.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  })
};

ThumbnailsBar.propTypes = {
  pictures: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Picture)).isRequired,
  variableValues: React.PropTypes.object.isRequired,
  activePicture: React.PropTypes.instanceOf(Picture).isRequired,
  pictureForPictureTool: React.PropTypes.instanceOf(Picture)
};
