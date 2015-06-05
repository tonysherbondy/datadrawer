import React from 'react';
import classNames from 'classnames';
import DrawingStateActions from '../actions/DrawingStateActions';
import Shape from '../models/shapes/Shape';
import PictureResult from '../models/PictureResult';
import VariablePill from './VariablePill';

export default class Popover extends React.Component {

  renderShapeData() {
    let shape = this.props.shape;
    if (!shape) {
      return 'No shape selected.';
    }
    let instruction = this.getDrawInstruction(shape.id);
    let instructionName = instruction.name;
    let props = ['strokeWidth', 'stroke', 'fill'];
    let propsUi = props.map(property => {
      let name = `${instructionName}'s ${property}`;
      let id = `${instruction.id}_${property}`;
      let variable = {id, name};
      return (
        <li className='shape-data-list-item' key={property}>
          <VariablePill variable={variable} />
          {instruction[property]}
        </li>
      );
    });
    return (
      <ul className='shape-data-list'>
        {propsUi}
      </ul>
    );
  }

  render() {
    let cName = classNames({
      popover: true,
      hidden: !this.props.isShown
    });
    return (
      <div className={cName} style={this.props.position}>
        <div className="left-panel-header">Data</div>
        <i
          onClick={this.handleClose.bind(this)}
          className="close-x fa fa-times"></i>
        {this.renderShapeData()}
      </div>
    );
  }

  getDrawInstruction(id) {
    return this.props.pictureResult.getDrawInstructionForShapeId(id);
  }

  handleClose() {
    DrawingStateActions.hideDataPopup();
  }

}

Popover.propTypes = {
  position: React.PropTypes.object,
  isShown: React.PropTypes.bool,
  pictureResult: React.PropTypes.instanceOf(PictureResult).isRequired,
  // I'm passing shape instead of instruction as I may need shape for measurements
  shape: React.PropTypes.instanceOf(Shape)
};
