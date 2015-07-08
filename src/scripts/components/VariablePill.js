import React from 'react';
import ContentEditable from './ContentEditable';
import PictureActions from '../actions/PictureActions';
import DataVariable from '../models/DataVariable';
import Picture from '../models/Picture';

export default class VariablePill extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditingName: false,
      name: props.name || props.variable.name
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({name: nextProps.name || nextProps.variable.name});
  }

  render() {
    if (this.state.isEditingName) {
      return (
        <ContentEditable
          ref="theContentEditable"
          className='variable-pill data-variable-name-editable'
          html={this.state.name}
          onKeyDown={this.handleKeyDown.bind(this)}
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
          {this.state.name}
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
    if (this.props.readOnly) {
      return;
    }
    this.setState({isEditingName: true}, () => {
      React.findDOMNode(this.refs.theContentEditable).focus();
    });
  }

  handleKeyDown(evt) {
    if (evt.which === 13) {
      // Cancel editing on enter key press
      this.setState({isEditingName: false});
    }
  }

  handleNameChange(evt) {
    let name = evt.target.value;
    this.setState({name});
    // Clone old variable and change name
    let newVariable = new DataVariable(this.props.variable);
    newVariable.name = name;
    PictureActions.modifyVariable(this.props.picture, newVariable);
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
  variable: React.PropTypes.instanceOf(DataVariable).isRequired,
  picture: React.PropTypes.instanceOf(Picture),
  name: React.PropTypes.string,
  readOnly: React.PropTypes.bool
};

VariablePill.defaultProps = {
  variable: {}
};
