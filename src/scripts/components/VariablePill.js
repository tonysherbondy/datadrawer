import React from 'react';

export default class VariablePill extends React.Component {

  render() {
    return (
      <span
        onDragStart={this.handleDragStart.bind(this)}
        draggable='true'
        dataVariableId={this.props.variable.id}
        className="variable-pill">
        {this.props.variable.name}
      </span>

    );
  }

  handleDragStart(evt) {
    let dataAttr = `data-variable-id='${this.props.variable.id}'`;
    let html = `<span class='variable-pill' ${dataAttr} draggable='true'>` +
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
