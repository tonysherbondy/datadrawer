import React from 'react';

class Rect extends React.Component {
  render() {
    return (
      <rect
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}>
       </rect>
    );
  }
}

Rect.propTypes = {
  x: React.PropTypes.number,
  y: React.PropTypes.number,
  width: React.PropTypes.number,
  height: React.PropTypes.number
};

export default Rect;
