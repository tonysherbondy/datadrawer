import React from 'react';

class Circle extends React.Component {
  render() {
    return (
      <circle
        r={this.props.r}
        cx={this.props.cx}
        cy={this.props.cy}>
       </circle>
    );
  }
}

Circle.propTypes = {
  r: React.PropTypes.number,
  cx: React.PropTypes.number,
  cy: React.PropTypes.number
};

export default Circle;
