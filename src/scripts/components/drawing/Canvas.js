import React from 'react';
import _ from 'lodash';
import {distanceBetweenPoints} from '../../utils/utils';
import InstructionActions from '../../actions/InstructionActions';
import DrawingStateActions from '../../actions/DrawingStateActions';
import ScaleInstruction from '../../models/ScaleInstruction';
import MoveInstruction from '../../models/MoveInstruction';
import Expression from '../../models/Expression';
import PictureResult from '../../models/PictureResult';
import InstructionTreeNode from '../../models/InstructionTreeNode';

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

  getMagnets({editingInstruction}) {
    // All shapes that are not the current editing shape
    // have magnets
    if (!editingInstruction || editingInstruction instanceof ScaleInstruction) {
      // Only draw magnets when we are currently drawing
      // Also, no magnets for scale
      return [];
    }

    let editingId = editingInstruction.shapeId;
    let {pictureResult} = this.props;
    let magnets = pictureResult.getAllShapesForCurrentLoopIndex()
                  .filter(shape => shape.id !== editingId)
                  .map(shape => shape.getMagnets());
    return _.flatten(magnets);
  }

  getSelectedShapePoints({selectedShape}) {
    if (!selectedShape) {
      return null;
    }
    return selectedShape.getMagnets();
  }

  getClosePoints(point, points, threshold = 20) {
    // Return magnets that are within a threshold distance away from position
    return (points || []).reduce((closePoints, shapePoint) => {
      let d = distanceBetweenPoints(point, shapePoint);
      return d < threshold ? closePoints.concat(shapePoint) : closePoints;
    }, []);
  }

  getCloseMagnets(point, threshold = 20) {
    return this.getClosePoints(point, this.state.magnets, threshold);
  }

  getCloseSelectedShapePoint(point, threshold = 5) {
    return this.getClosePoints(point, this.state.selectedShapePoints, threshold);
  }

  getEditingShape() {
    let {shapeId} = this.props.editingInstruction;
    return this.props.pictureResult.getShapeById(shapeId);
  }

  drawShape(shape, key, props) {
    if (shape.index) {
      key = key + `_${shape.index}`;
    }
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
    let {pictureResult} = this.props;
    return pictureResult.getAllShapes()
            .filter(shape => shape.id !== 'canvas')
            .map(shape => this.drawShape(shape, shape.id, shape.getRenderProps()));
  }

  drawMagnets() {
    let drawMagnet = (magnet) => {
      let id = `magnet_${magnet.shapeId}_${magnet.pointName}`;
      // TODO probably better way to handle this is to make magnet a component
      return (
        <circle key={id} className='magnet' r='5' cx={magnet.x} cy={magnet.y} />
      );
    };
    return this.state.magnets.map(drawMagnet);
  }

  drawCloseMagnetShapeOutline() {
    let magnet = this.state.closeMagnet;
    if (!magnet) {
      return null;
    }
    let closeShape = this.props.pictureResult.getShapeById(magnet.shapeId);
    return this.drawShape(closeShape, `magnet_outline`, closeShape.getMagnetOutlineProps());
  }

  drawSelectedShapeControlPoints() {
    let drawControlPoint = (point) => {
      let id = `control_{point.shapeId}_${point.pointName}`;
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
      let {point} = this.getEventPoint(event);
      let {mode} = this.props.drawingState;
      let to = point;
      if (mode === 'scale') {
        let shape = this.props.selectedShape;
        let startPoint = this.state.startPoint;
        let props = shape.getAdjustProps(mode, startPoint, point);
        to = props.to;
        InstructionActions.modifyInstruction(instruction.getCloneWithTo(to, this.props.pictureResult, magnets));

      } else if (mode === 'move') {
        instruction.modifyWithTo(to, this.state.startPoint);

      } else {
        InstructionActions.modifyInstruction(instruction.getCloneWithTo(to, this.props.pictureResult, magnets));
      }
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
    let magnets = [];

    // There will only be magnets shown if we are currently editing
    // an instruction
    if (this.state.closeMagnet) {
      magnets = this.getCloseMagnets(point);
      // TODO need to consolidate naming convention
      point = Canvas.convertMagnetToPoint(this.state.closeMagnet);
    }
    return {point, magnets};
  }

  handleClick(event) {
    let {point, magnets} = this.getEventPoint(event);
    // TODO - probably need to use setState if we don't want any
    // ui glitches
    let instruction = this.props.editingInstruction;
    if (instruction) {
      if (!instruction.isValid()) {
        // This has to be a draw instruction, set the from
        // TODO - treat this as actually immutable
        InstructionActions.modifyInstruction(instruction.getCloneWithFrom(point, magnets));
      } else {

        if (this.props.drawingState.mode === 'path' && !event.shiftKey) {
          // if we are drawing a path and our instruction is valid
          // we need to add another point
          InstructionActions.modifyInstruction(instruction.getCloneWithAddedPoint(point, this.props.pictureResult, magnets));
        } else {
          // If we click when we have a valid editing instruction we are ending
          // the instruction editing
          DrawingStateActions.setDrawingMode('normal');
        }
      }
    } else {
      // No active instruction so let's see if we are about to do an adjust instruction
      let closeControlPoint = this.getCloseSelectedShapePoint(point)[0];
      let shape = this.props.selectedShape;
      if (closeControlPoint && shape) {
        let mode = this.props.drawingState.mode;
        if (mode === 'normal') {
          // Show a popup for changing data about the shape
          DrawingStateActions.showDataPopup();
        }

        if (mode === 'scale') {
          let props = shape.getAdjustProps(mode, closeControlPoint, point);
          if (props) {
            props.id = InstructionTreeNode.getNextInstructionId(this.props.instructions);
            this.state.startPoint = closeControlPoint;
            this.setState(this.state);
            this.props.pictureResult.insertNewInstructionAfterCurrent(new ScaleInstruction(props));
          }
        }

        if (mode === 'move') {
          let props = {
            id: InstructionTreeNode.getNextInstructionId(this.props.instructions),
            point: closeControlPoint.pointName,
            shape: {id: closeControlPoint.shapeId},
            x: new Expression(point.x - closeControlPoint.x),
            y: new Expression(point.y - closeControlPoint.y)
          };
          this.state.startPoint = closeControlPoint;
          this.setState(this.state);
          // TODO - for some reason I can't do the below setState??
          //this.setState({startPoint: closeControlPoint});
          this.props.pictureResult.insertNewInstructionAfterCurrent(new MoveInstruction(props));

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
  pictureResult: React.PropTypes.instanceOf(PictureResult).isRequired
};

// TODO - shouldn't need this, convert magnet to use same naming convention
Canvas.convertMagnetToPoint = function(magnet) {
  return {
    id: magnet.shapeId,
    point: magnet.pointName
  };
};

export default Canvas;

