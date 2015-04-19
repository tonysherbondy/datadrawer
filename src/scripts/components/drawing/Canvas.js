import React from 'react';
import Immutable from 'immutable';
import Circle from './Circle';

class Canvas extends React.Component {

  render() {
    return (
      <svg className="canvas">
        {this.props.shapes.map(shape => {
          return (
            <Circle {...shape.props} />
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
  shapes: Immutable.List()
};

export default Canvas;

