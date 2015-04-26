import React from 'react';

class Rect extends React.Component {
  render() {
    return (
      <rect {...this.props}
       ></rect>
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
