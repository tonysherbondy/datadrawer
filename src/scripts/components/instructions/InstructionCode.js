import React from 'react';

export default class InstructionCode extends React.Component {

  render() {
    return (
      <textarea value={this.props.code} readOnly={true}>
      </textarea>
    );
  }

}

InstructionCode.propTypes = {
  code: React.PropTypes.string
};
