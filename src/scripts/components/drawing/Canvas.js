import React from 'react';
import Circle from './Circle';

class Canvas extends React.Component {

  render() {
    return (
      <svg className="canvas">
        {this.props.shapes.map((shape, index) => {
          return (
            <Circle key={index} {...shape.props} />
          );
        })}
      </svg>
    );
  }
}

Canvas.propTypes = {
  shapes: React.PropTypes.object
};

Canvas.defaultProps = {
  shapes: []
};

export default Canvas;

