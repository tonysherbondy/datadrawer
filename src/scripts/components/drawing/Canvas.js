import React from 'react';
import _ from 'lodash';
import {distanceBetweenPoints} from '../../utils/utils';
import InstructionActions from '../../actions/InstructionActions';
import DrawingStateActions from '../../actions/DrawingStateActions';
import ScaleInstruction from '../../models/ScaleInstruction';
import MoveInstruction from '../../models/MoveInstruction';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      magnets: this.getMagnets(props),
      closeMagnet: null,
      selectedShapePoints: null,
      startPoint: null
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps) {
      this.state.magnets = this.getMagnets(newProps);
      this.state.selectedShapePoints = this.getSelectedShapePoints(newProps);
      this.setState(this.state);
    }
  }

  getMagnets({shapes, editingInstruction}) {
    // All shapes that are not the current editing shape
    // have magnets
    if (!editingInstruction || editingInstruction instanceof ScaleInstruction) {
      // Only draw magnets when we are currently drawing
      // Also, no magnets for scale
      return [];
    }

    let editingShapeName = editingInstruction.getShapeName();
    return _.flatten(shapes
            .filter(shape => shape.id !== editingShapeName)
            .map(shape => shape.getMagnets()));
  }

  getSelectedShapePoints({selectedShape}) {
    if (!selectedShape) {
      return null;
    }
    return selectedShape.getMagnets();
  }

  getClosePoints(point, points) {
    // Return magnets that are within a threshold distance away from position
    let threshold = 20;
    return (points || []).reduce((closePoints, shapePoint) => {
      let d = distanceBetweenPoints(point, shapePoint);
      return d < threshold ? closePoints.concat(shapePoint) : closePoints;
    }, []);
  }

  getCloseMagnets(point) {
    return this.getClosePoints(point, this.state.magnets);
  }

  getCloseSelectedShapePoint(point) {
    return this.getClosePoints(point, this.state.selectedShapePoints);
  }

  getEditingShape() {
    return this.props.shapes.find(shape => {
      return shape.id === this.props.editingInstruction.getShapeName();
    });
  }

  drawShape(shape, key, props) {
    if (shape.type === 'circle') {
      return (<circle key={key} {...props} />);

    } else if (shape.type === 'rect') {
      return (<rect key={key} {...props} />);

    } else if (shape.type === 'line') {
      return (<line key={key} {...props} />);
    } else if (shape.type === 'path') {
      return (<path key={key} {...props} />);
    } else if (shape.type === 'text') {
      return (
        <text key={key} {...props}>
          {shape.text}
        </text>
      );
    }
    console.error('Unknown type', shape.type);
  }

  drawShapes() {
    // Filter out canvas
    return this.props.shapes.filter(shape => shape.id !== 'canvas')
    .map((shape, index) => {
      return this.drawShape(shape, index, shape.getRenderProps());
    });
  }

  drawMagnets() {
    let drawMagnet = (magnet) => {
      let id = `magnet_${magnet.shapeName}_${magnet.pointName}`;
      // TODO probably better way to handle this is to make magnet a component
      return (
        <circle key={id} className='magnet' r='5' cx={magnet.x} cy={magnet.y} />
      );
    };
    return this.state.magnets.map(drawMagnet);
  }

  drawCloseMagnetShapeOutline() {
    if (!this.state.closeMagnet) {
      return null;
    }
    let magnet = this.state.closeMagnet;
    let closeShape = this.props.shapes.find(s => s.id === magnet.shapeName);
    return this.drawShape(closeShape, `magnet_outline`, closeShape.getMagnetOutlineProps());
  }

  drawSelectedShapeControlPoints() {
    let drawControlPoint = (point) => {
      let id = `control_{point.shapeName}_${point.pointName}`;
      // TODO probably better way to handle this is to make point a component
      return (
        <circle key={id} className='control-point' r='5' cx={point.x} cy={point.y} />
      );
    };
    return (this.state.selectedShapePoints || []).map(drawControlPoint);
  }

  handleMouseMove(event) {
    let {x, y} = this.getPositionOfEvent(event);
    let magnets = this.getCloseMagnets({x, y});
    if (magnets.length > 0) {
      this.state.closeMagnet = magnets[0];
      this.setState(this.state);
    } else {
      this.state.closeMagnet = null;
      this.setState(this.state);
    }

    let instruction = this.props.editingInstruction;
    if (instruction && instruction.isValid()) {
      let point = this.getEventPoint(event);
      let shape = this.getEditingShape();
      let {mode} = this.props.drawingState;
      let to = point;
      if (mode === 'scale' || mode === 'move') {
        let shape = this.props.selectedShape;
        let startPoint = this.state.startPoint;
        let props = shape.getAdjustProps(mode, startPoint, point);
        to = props.to;
      }
      InstructionActions.modifyInstruction(instruction.getCloneWithTo(to, shape));
    }
  }

  getPositionOfEvent(event) {
    let {left, bottom, height} = this.refs.canvas.getDOMNode().getBoundingClientRect();
    let x = Math.round(event.clientX - left);
    let y = Math.round(event.clientY - (bottom - height));
    return {x, y};
  }

  getEventPoint(event) {
    let point = this.getPositionOfEvent(event);

    // There will only be magnets shown if we are currently editing
    // an instruction
    if (this.state.closeMagnet) {
      // TODO need to consolidate naming convention
      point = {
        id: this.state.closeMagnet.shapeName,
        point: this.state.closeMagnet.pointName
      };
    }
    return point;
  }

  handleClick(event) {
    let point = this.getEventPoint(event);
    // TODO - probably need to use setState if we don't want any
    // ui glitches
    let instruction = this.props.editingInstruction;
    if (instruction) {
      if (!instruction.isValid()) {
        // This has to be a draw instruction, set the from
        // TODO - treat this as actually immutable
        InstructionActions.modifyInstruction(instruction.getCloneWithFrom(point));
      } else {
        // If we click when we have a valid editing instruction we are ending
        // the instruction editing
        DrawingStateActions.setDrawingMode('normal');
      }
    } else {
      // No active instruction so let's see if we are about to do an adjust instruction
      let closeControlPoint = this.getCloseSelectedShapePoint(point)[0];
      let shape = this.props.selectedShape;
      if (closeControlPoint && shape) {
        let mode = this.props.drawingState.mode;
        if (mode === 'scale' || mode === 'move') {
          let props = shape.getAdjustProps(mode, closeControlPoint, point);
          if (props) {
            props.id = this.props.instructions.length + 1;
            this.state.startPoint = closeControlPoint;
            this.setState(this.state);
            let IClass = mode === 'scale' ? ScaleInstruction : MoveInstruction;
            InstructionActions.addInstruction(new IClass(props));
          }
        }
      }
    }
  }

  render() {
    return (
      <svg ref='canvas' className="canvas" onClick={this.handleClick.bind(this)} onMouseMove={this.handleMouseMove.bind(this)}>
        {this.drawShapes()}
        {this.drawMagnets()}
        {this.drawCloseMagnetShapeOutline()}
        {this.drawSelectedShapeControlPoints()}
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

