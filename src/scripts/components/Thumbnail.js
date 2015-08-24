import React, { PropTypes } from 'react';
import classNames from 'classnames';

import Canvas from './drawing/Canvas';
import ShapesCompiler from '../utils/ShapesCompiler';

@ShapesCompiler()
export default class Thumbnail {
  static propTypes = {
    notebook: PropTypes.object.isRequired,
    // TODO - Come up with less ambiguous name that the compiler can use as well
    activePicture: PropTypes.object.isRequired,
    onThumbnailClick: PropTypes.func.isRequired,
    isActivePicture: PropTypes.bool,
    isPictureForPictureTool: PropTypes.bool
  }

  static contextTypes = {
    actions: PropTypes.shape({
      picture: PropTypes.object.isRequired
    }),
    router: PropTypes.func.isRequired
  }

  render() {
    let className = classNames('picture-thumbnail', {
      'active-picture-thumbnail': this.props.isActivePicture,
      'picture-for-picture-tool-thumbnail': this.props.isPictureForPictureTool
    });
    return (
      <a
        className='picture-thumbnail-wrapper'
        onClick={this.handleThumbnailClick.bind(this)}>
        <Canvas
          className={className}
          activePicture={this.props.activePicture}
          drawingMode={'normal'}
          shapes={this.props.shapes} />
        <i
          onClick={this.handlePreviewPicture.bind(this)}
          className="preview-picture-button fa fa-external-link"></i>
        <i
          onClick={this.handleDeletePicture.bind(this)}
          className="delete-picture-button fa fa-trash"></i>
      </a>
    );
  }

  handleDeletePicture(evt) {
    this.context.actions.picture.deletePicture(this.props.activePicture);
    evt.stopPropagation();
    evt.preventDefault();
  }

  handlePreviewPicture(evt) {
    let notebookId = this.props.notebook.id;
    let pictureId = this.props.activePicture.id;
    let url = `/notebook/${notebookId}/picture/${pictureId}/view`;
    this.context.router.transitionTo(url);
    evt.stopPropagation();
    evt.preventDefault();
  }

  handleThumbnailClick(evt) {
    this.props.onThumbnailClick(this.props.activePicture);
    evt.preventDefault();
  }
}
