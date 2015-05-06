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
    let html = VariablePill.getHtmlString(this.props.variable);
    evt.dataTransfer.setData('text/html',
      `${html}&nbsp;` +
      `<span id="${VariablePill.cursorLocationId}"></span>`);
  }

}

VariablePill.cursorLocationId = 'cursorLocation';

VariablePill.getHtmlString = function(variable) {
  let dataAttr = `data-variable-id='${variable.id}'`;
  let attrs = `class='variable-pill' ${dataAttr} draggable='true'`;
  return `<span ${attrs}>${variable.name}</span>`;
};

VariablePill.getVariableName = function(variables, id) {
  return variables.filter(v => v.id === id).map(v => v.name)[0];
};

VariablePill.propTypes = {
  variable: React.PropTypes.object
};

VariablePill.defaultProps = {
  variable: {}
};
