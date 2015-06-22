import React from 'react';
import Expression from '../models/Expression';
import Popover from './Popover';
import ColorPicker from './ColorPicker';

export default class ColorExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopoverShown: false,
      popoverPosition: {top: 0, left: 0}
    };
  }

  render() {
    // TODO - might need index for evaluate
    let color = this.props.definition.evaluate(this.props.variableValues);
    return (
      <div className="color-expression-editor" onClick={this.handleClick.bind(this)} style={{backgroundColor: color}}>
        <Popover
          picture={this.props.picture}
          handleClose={this.handlePopoverClose.bind(this)}
          position={this.state.popoverPosition}
          isShown={this.state.isPopoverShown}>
          <ColorPicker color={color} handleChange={this.handleColorChange.bind(this)} />
        </Popover>
      </div>
    );
  }

  handleColorChange(color) {

    // Only update the app if the expression is valid
    let {r, g, b, a} = color;
    a = a / 100;
    let colorFragment = `'rgba(${r}, ${g}, ${b}, ${a})'`;
    let newExpression = new Expression(colorFragment);
    let value = newExpression.evaluate(this.props.variableValues);
    if (value instanceof Error) {
      console.log('Invalid Expression', value.message);
    } else {
      this.props.onChange(newExpression);
    }

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
  onChange: React.PropTypes.func.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired,
  variableValues: React.PropTypes.object.isRequired
};
