import React from 'react';

class Canvas extends React.Component {

  drawShapes() {
    // Filter out canvas
    return this.props.shapes.filter(shape => shape.name !== 'canvas')
    .map((shape, index) => {
      if (shape.type === 'circle') {
        return (<circle key={index} {...shape.getRenderProps()} />);

      } else if (shape.type === 'rect') {
        return (<rect key={index} {...shape.getRenderProps()} />);

      } else if (shape.type === 'line') {
        return (<line key={index} {...shape.getRenderProps()} />);
      } else if (shape.type === 'path') {
        return (<path key={index} {...shape.getRenderProps()} />);
      } else if (shape.type === 'text') {
        return (
          <text key={index} {...shape.getRenderProps()}>
            {shape.text}
          </text>
        );
      }
      console.error('Unknown shape type', shape.type);
    });
  }

  render() {
    return (
      <svg className="canvas">
        {this.drawShapes()}
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

