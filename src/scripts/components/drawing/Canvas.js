import React from 'react';
import _ from 'lodash';
import {distanceBetweenPoints} from '../../utils/utils';

import ScaleInstruction from '../../models/ScaleInstruction';
import ExtendPathInstruction from '../../models/ExtendPathInstruction';
import MoveInstruction from '../../models/MoveInstruction';
import RotateInstruction from '../../models/RotateInstruction';
import Expression from '../../models/Expression';
import ShapesMap from '../../models/shapes/ShapesMap';
import Instruction from '../../models/Instruction';
import Shape from '../../models/shapes/Shape';
import PathShape from '../../models/shapes/PathShape';
import Picture from '../../models/Picture';

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
    let {editingInstruction, shapes} = this.props;
    if (!editingInstruction || editingInstruction instanceof ScaleInstruction) {
      // Only draw magnets when we are currently drawing
      // Also, no magnets for scale
      return [];
    }

    let editingId = editingInstruction.shapeId;
    let magnets = shapes.getAllShapesForLoopIndex(this.props.currentLoopIndex)
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
    let {shapes, currentLoopIndex} = this.props;
    return shapes.getShapeByIdAndIndex(shapeId, currentLoopIndex);
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
    } else if (shape.type === 'picture') {
      // TODO: (nhan) factor this out into a seperate picture component
      let shapeElements = _.values(shape.shapes)
        .filter(subShape => subShape.id !== 'canvas')
        .map((subShape) =>
          this.drawShape(subShape, subShape.id, subShape.getRenderProps()));

      let transform = `${props.transform} translate(${props.x}, ${props.y})`;

      return (
        <g key={key} transform={transform}>{shapeElements}</g>
      );
    }
    console.error('Unknown type', shape.type);
  }

  drawShapes() {
    // Filter out canvas
    return this.props.shapes.getAllShapes()
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
    let {shapes, currentLoopIndex} = this.props;
    let closeShape = shapes.getShapeByIdAndIndex(magnet.shapeId, currentLoopIndex);
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
    let pictureActions = this.context.actions.picture;
    let {x, y} = this.getPositionOfEvent(event);
    let magnets = this.getCloseMagnets({x, y});
    // Can just set to first because it is protected from out of bound lookup
    this.setState({closeMagnet: _.first(magnets) || null});

    let picture = this.props.activePicture;
    let instruction = this.props.editingInstruction;

    if (instruction && instruction.isValid()) {
      let {point} = this.getEventPoint(event);
      let {drawingMode} = this.props;
      let startPoint = this.state.startPoint;
      let to = point;
      if (drawingMode === 'scale') {
        let shape = this.props.selectedShape;
        let props = shape.getScaleAdjustProps(startPoint, point);
        to = props.to;
        pictureActions.modifyInstruction(picture, instruction.getCloneWithTo(to, this.props.shapes, this.props.currentLoopIndex, magnets));

      } else if (drawingMode === 'rotate' || drawingMode === 'move' || drawingMode === 'extend path') {
        instruction.modifyWithTo(pictureActions, picture, to, startPoint);

      } else {
        pictureActions.modifyInstruction(picture, instruction.getCloneWithTo(to, this.props.shapes, this.props.currentLoopIndex, magnets));
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
    let {activePicture} = this.props;
    let instruction = this.props.editingInstruction;
    if (instruction) {
      if (!instruction.isValid()) {
        // This has to be a draw instruction, set the from
        // TODO - treat this as actually immutable
        this.context.actions.picture.modifyInstruction(activePicture, instruction.getCloneWithFrom(point, magnets));
      } else {

        if (this.props.drawingMode === 'path' && !event.shiftKey) {
          // if we are drawing a path and our instruction is valid
          // we need to add another point
          let newInstruction = instruction.getCloneWithAddedPoint(point, this.props.shapes, magnets);
          this.context.actions.picture.modifyInstruction(activePicture, newInstruction);
        } else {
          // If we click when we have a valid editing instruction we are ending
          // the instruction editing
          this.context.actions.drawingState.setDrawingMode('normal');
        }
      }
    } else {
      // No active instruction so let's see if we are about to do an adjust instruction
      let closeControlPoint = this.getCloseSelectedShapePoint(point)[0];
      let shape = this.props.selectedShape;
      if (closeControlPoint && shape) {
        let mode = this.props.drawingMode;
        switch(mode) {
          case 'normal': {
            // Show a popup for changing data about the shape
            this.context.actions.drawingState.showDataPopup({
              left: event.pageX + 10,
              top: event.pageY + 10
            });
            break;
          }
          case 'extend path': {
            if (shape instanceof PathShape) {
              // Always extend from the last point on the path
              let lastPoint = shape.getPoint('last');
              let props = {
                shape: {id: closeControlPoint.shapeId},
                magnets,
                x: new Expression(point.x - lastPoint.x),
                y: new Expression(point.y - lastPoint.y)
              };
              this.setState({startPoint: lastPoint});
              this.context.actions.picture.insertInstructionAfterInstruction(
                this.props.activePicture.id,
                new ExtendPathInstruction(props),
                this.props.currentInstruction);
            }
            break;
          }
          case 'scale': {
            let props = shape.getScaleAdjustProps(closeControlPoint, point);
            if (props) {
              this.setState({startPoint: closeControlPoint});
              this.context.actions.picture.insertInstructionAfterInstruction(
                this.props.activePicture.id,
                new ScaleInstruction(props),
                this.props.currentInstruction);
            }
            break;
          }
          case 'rotate': {
            // For now we set the anchor point of rotation to the control point you clicked, but
            // eventually could be any point
            let {shapeId, pointName} = closeControlPoint;
            // 180 degrees per 100 pixels
            let props = {
              shape: {id: shapeId},
              point: {id: shapeId, point: pointName}
            };
            this.setState({startPoint: closeControlPoint});
            let newInstruction = (new RotateInstruction(props)).getCloneWithTo(point, closeControlPoint, this.props.currentLoopIndex);
            this.context.actions.picture.insertInstructionAfterInstruction(
              this.props.activePicture.id,
              newInstruction,
              this.props.currentInstruction);
            break;
          }
          case 'move': {
            // Holding shift while clicking on the control point will
            // make the move a reshape
            let props = {
              point: closeControlPoint.pointName,
              shape: {id: closeControlPoint.shapeId},
              isReshape: event.shiftKey,
              x: new Expression(point.x - closeControlPoint.x),
              y: new Expression(point.y - closeControlPoint.y)
            };
            this.setState({startPoint: closeControlPoint});
            this.context.actions.picture.insertInstructionAfterInstruction(
              this.props.activePicture.id,
              new MoveInstruction(props),
              this.props.currentInstruction);
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

// TODO - shouldn't need this, convert magnet to use same naming convention
Canvas.convertMagnetToPoint = (magnet) => {
  return {
    id: magnet.shapeId,
    point: magnet.pointName
  };
};

Canvas.contextTypes = {
  actions: React.PropTypes.shape({
    drawingState: React.PropTypes.object.isRequired,
    picture: React.PropTypes.object.isRequired
  })
};

// TODO: refering to types loaded from other files is unsafe here since they
// can be will undefined in this scope if there is a circular dependency
Canvas.propTypes = {
  shapes: React.PropTypes.instanceOf(ShapesMap).isRequired,
  currentInstruction: React.PropTypes.instanceOf(Instruction),
  currentLoopIndex: React.PropTypes.number,
  editingInstruction: React.PropTypes.instanceOf(Instruction),
  selectedShape: React.PropTypes.instanceOf(Shape),
  // Previously drawingState
  activePicture: React.PropTypes.instanceOf(Picture).isRequired,
  drawingMode: React.PropTypes.string.isRequired
};

export default Canvas;
