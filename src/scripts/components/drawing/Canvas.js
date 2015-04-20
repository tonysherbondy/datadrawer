import React from 'react';
import Circle from './Circle';
import Rect from './Rect';

class Canvas extends React.Component {

  render() {
    let shapes = this.props.shapes.map((shape, index) => {
      if (shape.type === 'circle') {
        return (<Circle key={index} {...shape.props} />);

      } else if (shape.type === 'rect') {
        return (<Rect key={index} {...shape.props} />);
      }
      console.error('Unknown shape type', shape.type);
    });
    return (
      <svg className="canvas">
        {shapes}
      </svg>
    );
  }
}

Canvas.propTypes = {
  shapes: React.PropTypes.array
};

Canvas.defaultProps = {
  shapes: []
};

export default Canvas;

