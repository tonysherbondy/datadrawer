import React from 'react';
import classNames from 'classnames';
import Draggable from 'react-draggable';

export default class Popover extends React.Component {

  render() {
    let popoverClassNames = classNames({
      popover: true,
      hidden: !this.props.isShown
    });
    let panelHeaderClassNames = classNames({
      'left-panel-header': true,
      'drag-handle': this.props.isDraggable
    });
    let popoverContents = (
      <div className={popoverClassNames} style={this.props.position}>
        <div className={panelHeaderClassNames}>Data</div>
        <i
          onClick={this.props.handleClose}
          className="close-x fa fa-times"></i>
        {this.props.children}
      </div>
    );

    if (this.props.isDraggable) {
      return (
        <Draggable zIndex={100} handle={'.drag-handle'}>
          {popoverContents}
        </Draggable>
      );
    } else {
      return popoverContents;
    }
  }

}

Popover.propTypes = {
  position: React.PropTypes.object,
  isDraggable: React.PropTypes.bool,
  isShown: React.PropTypes.bool
};
