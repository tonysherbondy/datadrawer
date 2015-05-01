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

  drawMagnets() {
    // All shapes that are not the current editing shape
    // have magnets
    let editingInstruction = this.props.editingInstruction;
    if (!editingInstruction) {
      // Only draw magnets when we are currently drawing
      return null;
    }

    let editingShapeName = editingInstruction.getShapeName();
    function drawMagnet(magnet) {
      let id = `magnet_${magnet.shapeName}_${magnet.pointName}`;
      return (
        <circle key={id} className='magnet' r='5' cx={magnet.x} cy={magnet.y} />
      );
    }
    return this.props.shapes.filter(shape => shape.name !== editingShapeName)
            .map(shape => {
              return (
                <g key={shape.name}>
                  {shape.getMagnets().map(drawMagnet)}
                </g>
              );
            });
  }

  render() {
    console.log('props', this.props);
    return (
      <svg className="canvas">
        {this.drawShapes()}
        {this.drawMagnets()}
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

