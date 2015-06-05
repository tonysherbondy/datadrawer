import React from 'react';
import classNames from 'classnames';
import DrawingStateActions from '../actions/DrawingStateActions';

export default class Popover extends React.Component {

  render() {
    let cName = classNames({
      popover: true,
      hidden: !this.props.show
    });
    return (
      <div className={cName} style={this.props.position}>
        <div className="close-x" onClick={this.handleClose.bind(this)}>X</div>
        Dat popover do
      </div>
    );
  }

  handleClose() {
    DrawingStateActions.hideDataPopup();
  }

}
