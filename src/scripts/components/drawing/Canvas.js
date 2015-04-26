import React from 'react';

class Canvas extends React.Component {

  render() {
    let shapes = this.props.shapes.map((shape, index) => {
      if (shape.type === 'circle') {
        return (<circle key={index} {...shape.getRenderProps()} />);

      } else if (shape.type === 'rect') {
        return (<rect key={index} {...shape.getRenderProps()} />);

      } else if (shape.type === 'line') {
        return (<line key={index} {...shape.getRenderProps()} />);
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

