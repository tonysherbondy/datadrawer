import React from 'react';
import ContentEditable from './ContentEditable';
import DataVariable from '../models/DataVariable';
import _ from 'lodash';
//import Picture from '../models/Picture';

class VariablePill extends React.Component {

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
    evt.dataTransfer.setData('datavariable', this.props.variable.id);
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
      let element = React.findDOMNode(this.refs.theContentEditable);
      element.focus();
      this.selectAllContentEditable(element);
    });
  }

  selectAllContentEditable(element) {
    let nodes = element.childNodes;
    let startNode = nodes[0];
    let endNode = nodes[nodes.length - 1];
    let endOffset = endNode.length;

    try {
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.setStart(startNode, 0);
      range.setEnd(endNode, endOffset);
      window.getSelection().addRange(range);
    }
    catch (err) {
      console.warn('selecting all content editable', err);
    }
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
    this.context.actions.picture.modifyVariable(this.props.picture, newVariable);
  }

}

VariablePill.cursorLocationId = 'cursorLocation';

VariablePill.getHtmlString = function(variable, fragmentIndex) {
  let dataAttrId = `data-variable-id="${variable.id}"`;
  let dataAttrProp = variable.prop ? `data-variable-prop="${variable.prop}"` : '';
  let fragmentAttr = isFinite(fragmentIndex) ? `data-fragment-index="${fragmentIndex}"` : '';
  let attrs = `class="variable-pill" ${fragmentAttr} ${dataAttrId} ` +
              `${dataAttrProp} draggable="true" contenteditable="false"`;
  return `<span ${attrs}>${variable.name}</span>`;
};

VariablePill.getHtmlStringFromFragment = function(fragment, fragmentIndex, picture) {
  let variable = picture.getVariableForFragment(fragment);
  return VariablePill.getHtmlString(variable, fragmentIndex);
};

// TODO - probably need to handle shape variable as well
VariablePill.getVarFromDropData = function(dataTransfer) {
  let dropData = dataTransfer.getData('text/html');
  let id = _.last(/data-variable-id="([a-zA-Z_0-9]*)"/.exec(dropData));
  let prop = _.last(/data-variable-prop="([a-zA-Z_0-9]*)"/.exec(dropData));
  let name = _.last(/>([a-zA-Z_0-9\s]+)<\/span>/.exec(dropData));
  return {id, name, prop};
};

// TODO - For some reason, when I added the dependency of DrawPictureInstruction to
// Picture to search for all variables, it makes it so that Picture is not resolved
// by this time, it is still some esModule placeholder... Need to investigate this further
//console.log(Picture);
console.warn('Bring back Picture PropType check');

VariablePill.propTypes = {
  variable: React.PropTypes.object.isRequired,
  picture: React.PropTypes.object,
  //picture: React.PropTypes.instanceOf(Picture),
  name: React.PropTypes.string,
  readOnly: React.PropTypes.bool
};

VariablePill.defaultProps = {
  variable: {}
};

VariablePill.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  })
};

export default VariablePill;
