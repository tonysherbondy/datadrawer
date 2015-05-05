import React from 'react';
import InstructionActions from '../../actions/InstructionActions';

export default class NameField extends React.Component {

  handleKeyDown(event) {
    // when the input is focused, we don't want to also be changing the mode
    event.stopPropagation();
  }

  handleChange(event) {
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
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange.bind(this)}
          value={name}
        />
      </div>
    );
  }
}

NameField.propTypes = {
  name: React.PropTypes.name
};

