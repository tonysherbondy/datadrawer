import React from 'react';

class Circle extends React.Component {
  render() {
    return (
      <circle
        {...this.props}
       ></circle>
    );
  }
}

Circle.propTypes = {
  r: React.PropTypes.number,
  cx: React.PropTypes.number,
  cy: React.PropTypes.number
};

export default Circle;
