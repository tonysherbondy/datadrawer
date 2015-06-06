import React from 'react';
import classNames from 'classnames';

export default class Popover extends React.Component {

  render() {
    let cName = classNames({
      popover: true,
      hidden: !this.props.isShown
    });
    return (
      <div className={cName} style={this.props.position}>
        <div className="left-panel-header">Data</div>
        <i
          onClick={this.props.handleClose}
          className="close-x fa fa-times"></i>
        {this.props.children}
      </div>
    );
  }

}

Popover.propTypes = {
  position: React.PropTypes.object,
  isShown: React.PropTypes.bool
};
