import React from 'react';
import classNames from 'classnames';

class InstructionCode extends React.Component {
  render() {
    return (
      <div className={classNames('instruction-code', this.props.className)}>
        <textarea value={this.props.code} readOnly={true}>
        </textarea>
      </div>
    );
  }
}

InstructionCode.propTypes = {
  code: React.PropTypes.string
};

export default InstructionCode;
