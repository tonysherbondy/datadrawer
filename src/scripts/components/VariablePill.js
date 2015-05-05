import React from 'react';

export default class VariablePill extends React.Component {

  render() {
    return (
      <span
        onDragStart={this.handleDragStart.bind(this)}
        draggable='true'
        className="variable-pill">
        {this.props.variable.name}
      </span>

    );
  }

  handleDragStart(evt) {
    let html = `<span class='variable-pill' draggable='true'>` +
                this.props.variable.name +
                `</span>`;
    evt.dataTransfer.setData('text/html',
      `${html}&nbsp;` +
      `<span id="${VariablePill.cursorLocationId}"></span>`);
  }

}

VariablePill.cursorLocationId = 'cursorLocation';

VariablePill.propTypes = {
  variable: React.PropTypes.object
};

VariablePill.defaultProps = {
  variable: {}
};
