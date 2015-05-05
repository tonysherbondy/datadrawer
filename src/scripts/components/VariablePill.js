import React from 'react';

export default class VariablePill extends React.Component {

  render() {
    return (
      <span
        draggable='true'
        className="variable-pill">
        {this.props.variable.name}
      </span>

    );
  }

}

VariablePill.propTypes = {
  variable: React.PropTypes.object
};

VariablePill.defaultProps = {
  variable: {}
};
