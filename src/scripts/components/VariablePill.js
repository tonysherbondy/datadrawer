import React from 'react';
import ContentEditable from './ContentEditable';

export default class VariablePill extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isEditingName: false};
  }

  render() {
    if (this.state.isEditingName) {
      return (
        <ContentEditable
          className='variable-pill data-variable-name-editable'
          html={this.props.variable.name}
          onBlur={this.handleBlur.bind(this)}
          onChange={this.handleNameChange.bind(this)} />
      );
    } else {
      return (
        <span
          onDoubleClick={this.handleDoubleClick.bind(this)}
          onDragStart={this.handleDragStart.bind(this)}
          draggable='true'
          dataVariableId={this.props.variable.id}
          className="variable-pill">
          {this.props.variable.name}
        </span>

      );
    }
  }

  handleDragStart(evt) {
    let html = VariablePill.getHtmlString(this.props.variable);
    evt.dataTransfer.setData('text/html',
      `${html}&nbsp;` +
      `<span id="${VariablePill.cursorLocationId}"></span>`);
  }

  handleBlur() {
    this.setState({isEditingName: false});
  }

  handleDoubleClick() {
    if (this.props.handleNameChange) {
      this.setState({isEditingName: true});
    }
  }

  handleNameChange(evt) {
    console.log('evt', evt);
    console.log('name change', evt.target.value);
  }

}

VariablePill.cursorLocationId = 'cursorLocation';

VariablePill.getHtmlString = function(variable, fragmentIndex) {
  let dataAttr = `data-variable-id="${variable.id}"`;
  let fragmentAttr = isFinite(fragmentIndex) ? `data-fragment-index="${fragmentIndex}"` : '';
  let attrs = `class="variable-pill" ${fragmentAttr} ${dataAttr} draggable="true" contenteditable="false"`;
  return `<span ${attrs}>${variable.name}</span>`;
};

VariablePill.getHtmlStringFromFragment = function(fragment, fragmentIndex, variables) {
  let id = fragment.id;
  let name = VariablePill.getVariableName(variables, id);
  return VariablePill.getHtmlString({id, name}, fragmentIndex);
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
