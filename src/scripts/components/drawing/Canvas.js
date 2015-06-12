import React from 'react';
import _ from 'lodash';
import {distanceBetweenPoints} from '../../utils/utils';
import PictureActions from '../../actions/PictureActions';
import DrawingStateActions from '../../actions/DrawingStateActions';
import ScaleInstruction from '../../models/ScaleInstruction';
import MoveInstruction from '../../models/MoveInstruction';
import RotateInstruction from '../../models/RotateInstruction';
import Expression from '../../models/Expression';
import PictureResult from '../../models/PictureResult';
import InstructionTreeNode from '../../models/InstructionTreeNode';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      closeMagnet: null,
      startPoint: null
    };
  }

  getMagnets() {
    // All shapes that are not the current editing shape
    // have magnets
    let {editingInstruction, pictureResult} = this.props;
    if (!editingInstruction || editingInstruction instanceof ScaleInstruction) {
      // Only draw magnets when we are currently drawing
      // Also, no magnets for scale
      return [];
    }

    let editingId = editingInstruction.shapeId;
    let magnets = pictureResult.getAllShapesForCurrentLoopIndex()
                  .filter(shape => shape.id !== editingId)
                  .map(shape => shape.getMagnets());
    return _.flatten(magnets);
  }

  getSelectedShapePoints() {
    let {selectedShape} = this.props;
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
    return this.getClosePoints(point, this.getMagnets(), threshold);
  }

  getCloseSelectedShapePoint(point, threshold = 5) {
    return this.getClosePoints(point, this.getSelectedShapePoints(), threshold);
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
    return this.getMagnets().map(drawMagnet);
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
    return (this.getSelectedShapePoints() || []).map(drawControlPoint);
  }

  handleMouseMove(event) {
    let {x, y} = this.getPositionOfEvent(event);
    let magnets = this.getCloseMagnets({x, y});
    // Can just set to first because it is protected from out of bound lookup
    this.setState({closeMagnet: _.first(magnets) || null});

    let picture = this.props.drawingState.activePicture;
    let instruction = this.props.editingInstruction;

    if (instruction && instruction.isValid()) {
      let {point} = this.getEventPoint(event);
      let {mode} = this.props.drawingState;
      let startPoint = this.state.startPoint;
      let to = point;
      if (mode === 'scale') {
        let shape = this.props.selectedShape;
        let props = shape.getScaleAdjustProps(startPoint, point);
        to = props.to;
        PictureActions.modifyInstruction(picture, instruction.getCloneWithTo(to, this.props.pictureResult, magnets));

      } else if (mode === 'rotate') {
        instruction.modifyWithTo(picture, to, startPoint);

      } else if (mode === 'move') {
        instruction.modifyWithTo(picture, to, startPoint);

      } else {
        PictureActions.modifyInstruction(picture, instruction.getCloneWithTo(to, this.props.pictureResult, magnets));
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
    let picture = this.props.drawingState.activePicture;
    let instructions = picture.instructions;
    let instruction = this.props.editingInstruction;
    if (instruction) {
      if (!instruction.isValid()) {
        // This has to be a draw instruction, set the from
        // TODO - treat this as actually immutable
        PictureActions.modifyInstruction(picture, instruction.getCloneWithFrom(point, magnets));
      } else {

        if (this.props.drawingState.mode === 'path' && !event.shiftKey) {
          // if we are drawing a path and our instruction is valid
          // we need to add another point
          PictureActions.modifyInstruction(picture, instruction.getCloneWithAddedPoint(point, this.props.pictureResult, magnets));
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
        switch(mode) {
          case 'normal': {
            // Show a popup for changing data about the shape
            DrawingStateActions.showDataPopup({
              left: event.pageX + 10,
              top: event.pageY + 10
            });
            break;
          }
          case 'scale': {
            let props = shape.getScaleAdjustProps(closeControlPoint, point);
            if (props) {
              props.id = InstructionTreeNode.getNextInstructionId(instructions);
              this.setState({startPoint: closeControlPoint});
              this.props.pictureResult.insertNewInstructionAfterCurrent(new ScaleInstruction(props));
            }
            break;
          }
          case 'rotate': {
            // For now we set the anchor point of rotation to the control point you clicked, but
            // eventually could be any point
            let {shapeId, pointName} = closeControlPoint;
            // 180 degrees per 100 pixels
            let props = {
              id: InstructionTreeNode.getNextInstructionId(instructions),
              shape: {id: shapeId},
              point: {id: shapeId, point: pointName}
            };
            this.setState({startPoint: closeControlPoint});
            let newInstruction = (new RotateInstruction(props)).getCloneWithTo(point, closeControlPoint);
            this.props.pictureResult.insertNewInstructionAfterCurrent(newInstruction);
            break;
          }
          case 'move': {
            // Holding shift while clicking on the control point will
            // make the move a reshape
            let props = {
              id: InstructionTreeNode.getNextInstructionId(instructions),
              point: closeControlPoint.pointName,
              shape: {id: closeControlPoint.shapeId},
              isReshape: event.shiftKey,
              x: new Expression(point.x - closeControlPoint.x),
              y: new Expression(point.y - closeControlPoint.y)
            };
            this.setState({startPoint: closeControlPoint});
            this.props.pictureResult.insertNewInstructionAfterCurrent(new MoveInstruction(props));
            break;
          }
        }
      }
    }
  }

  render() {
    return (
      <svg
        width='800'
        height='600'
        viewBox='0 0 800 600'
        ref='canvas'
        className={this.props.className}
        onClick={this.handleClick.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}>
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

