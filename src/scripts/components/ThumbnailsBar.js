import React, { PropTypes } from 'react';
import Picture from '../models/Picture';
import Thumbnail from './Thumbnail';
import SvgToPng from 'utils/SvgToPng';

export default class ThumbnailsBar {
  static contextTypes = {
    actions: PropTypes.shape({
      picture: PropTypes.object.isRequired
    }),
    router: PropTypes.func.isRequired
  }
  static propTypes = {
    notebook: PropTypes.object.isRequired,
    variableValues: PropTypes.object.isRequired,
    activePicture: PropTypes.instanceOf(Picture).isRequired,
    pictureForPictureTool: PropTypes.instanceOf(Picture)
  }

  getThumbnailsBar() {
    let {activePicture, pictureForPictureTool, notebook } = this.props;
    let pictures = notebook.pictures.valueSeq().toArray();
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
      return (
        <Thumbnail key={picture.id}
          ref={this.getThumbnailRef(picture)}
          activePicture={picture}
          notebook={notebook}
          variableValues={this.props.variableValues}
          onThumbnailClick={this.props.onThumbnailClick}
          isPictureForPictureTool={pictureForPictureTool &&
                                  picture.id === pictureForPictureTool.id}
          isActivePicture={picture.id === activePicture.id} />
      );
    };
    return pictures.concat([null]).map(getThumbnailForPicture);
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

  getThumbnailRef(picture) {
    return `thumbnail-${picture.id}`;
  }

  getPng(picture) {
    let thumbnail = this.refs[this.getThumbnailRef(picture)];
    let canvasNode = React.findDOMNode(thumbnail.refs.canvas);
    return (new SvgToPng(canvasNode)).getPng();
  }

}

