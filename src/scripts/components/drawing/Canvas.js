import React from 'react';
import _ from 'lodash';
import {distanceBetweenPoints} from '../../utils/utils';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      magnets: this.getMagnets(props)
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps) {
      this.state.magnets = this.getMagnets(newProps);
      this.setState(this.state);
    }
  }

  getMagnets({shapes, editingInstruction}) {
    // All shapes that are not the current editing shape
    // have magnets
    if (!editingInstruction) {
      // Only draw magnets when we are currently drawing
      return [];
    }

    let editingShapeName = editingInstruction.getShapeName();
    return _.flatten(shapes
            .filter(shape => shape.name !== editingShapeName)
            .map(shape => shape.getMagnets()));
  }

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

  handleMagnetClick(id) {
    let [, shapeName, pointName] = id.split('_');
    console.log('draw from', shapeName, pointName);
  }

  getCloseMagnets(point) {
    // Return magnets that are within a threshold distance away from position
    let threshold = 20;
    return this.state.magnets.reduce((closeMagnets, magnet) => {
      let d = distanceBetweenPoints(point, magnet);
      return d < threshold ? closeMagnets.concat(magnet) : closeMagnets;
    }, []);
  }

  drawMagnets() {
    let drawMagnet = (magnet) => {
      let id = `magnet_${magnet.shapeName}_${magnet.pointName}`;
      // TODO probably better way to handle this is to make magnet a component
      return (
        <circle onClick={this.handleMagnetClick.bind(this,id)} key={id} className='magnet' r='5' cx={magnet.x} cy={magnet.y} />
      );
    };
    return this.state.magnets.map(drawMagnet);
  }

  handleMouseMove(e) {
    let {left, bottom, height} = this.refs.canvas.getDOMNode().getBoundingClientRect();
    let x = e.clientX - left;
    let y = e.clientY - (bottom - height);
    let magnets = this.getCloseMagnets({x, y});
    if (magnets.length > 0) {
      let {shapeName, pointName} = magnets[0];
      console.log(`found ${shapeName}'s ${pointName} close enough`);
    }
  }

  render() {
    return (
      <svg ref='canvas' className="canvas" onMouseMove={this.handleMouseMove.bind(this)}>
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

