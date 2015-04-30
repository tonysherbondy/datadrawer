import React from 'react';

export default class InstructionTitle extends React.Component {

  render() {
    let titleUi = this.props.instruction ? this.props.instruction.getUiSentence() : '';
    return (
      <div className="instruction-title">
        {titleUi}
      </div>
    );
  }
}
