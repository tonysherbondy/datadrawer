import React from 'react';
import Expression from '../models/Expression';
import PictureResult from '../models/PictureResult';
import Popover from './Popover';

export default class ColorExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopoverShown: false,
      popoverPosition: {top: 0, left: 0}
    };
  }

  render() {
    let {variableValues} = this.props.pictureResult;
    // TODO - might need index for evaluate
    let color = this.props.definition.evaluate(variableValues);
    return (
      <div className="color-expression-editor" onClick={this.handleClick.bind(this)} style={{backgroundColor: color}}>
        <Popover
          handleClose={this.handlePopoverClose.bind(this)}
          position={this.state.popoverPosition}
          isShown={this.state.isPopoverShown}>
          Color Popover
        </Popover>
      </div>
    );
  }

  handleClick() {
    let node = React.findDOMNode(this);
    this.setState({
      isPopoverShown: !this.state.isPopoverShown,
      popoverPosition: {top: node.offsetTop + 10, left: node.offsetLeft + 10}
    });
  }

  handlePopoverClose() {
    this.setState({isPopoverShown: false});
  }
}

ColorExpressionEditor.propTypes = {
  definition: React.PropTypes.instanceOf(Expression).isRequired,
  pictureResult: React.PropTypes.instanceOf(PictureResult).isRequired
};
