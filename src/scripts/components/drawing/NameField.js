import React from 'react';
import InstructionActions from '../../actions/InstructionActions';

export default class NameField extends React.Component {

  handleKeyDown(event) {
    // when the input is focused, we don't want to also be changing the mode
    event.stopPropagation();
  }

  handleKeyUp(event) {
    var val = this.refs.nameField.getDOMNode().value.trim();
    InstructionActions.setName(val);
    event.stopPropagation();
  }

  render() {
    let name = this.props.name;
    return (
      <div className="name-field">
        <input
          ref="nameField"
          id="name-field"
          placeholder="Untitled Picture"
          onKeyUp={this.handleKeyUp.bind(this)}
          onKeyDown={this.handleKeyDown}
        />
        <span className="picture-name">{name}</span>
      </div>
    );
  }
}

NameField.propTypes = {
  name: React.PropTypes.name
};

