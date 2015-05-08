import React from 'react';
import _ from 'lodash';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';

export default class ExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorFragmentIndex: null,
      cursorOffset: 0,
      fragments: this.getSpaceBufferedFragments(props.definition.fragments),
      showDefinition: false
    };
  }

  getSpaceBufferedFragments(fragments) {
    // Can't have a variable pill be the beginning or end of fragments array
    let newFragments = [].concat(fragments);
    if (!_.isString(fragments[0])) {
      newFragments = [' '].concat(newFragments);
    }
    if (!_.isString(_.last(newFragments))) {
      newFragments = newFragments.concat([' ']);
    }
    // Can't have two consecutive variables without a space between
    newFragments = newFragments.reduce((cum, fragment) => {
      if (fragment.id && _.last(cum).id) {
        return cum.concat([' ', fragment]);
      }
      return cum.concat([fragment]);
    }, []);
    return newFragments;
  }

  getCursorSpan() {
    return `<span id='${VariablePill.cursorLocationId}'></span>`;
  }

  getHtml(fragments) {
    let escSpace = f => f.replace(/ /g, '&nbsp;');
    return fragments.map((fragment, i) => {
      if (_.isString(fragment)) {
        return escSpace(fragment);
      }
      return VariablePill.getHtmlStringFromFragment(fragment, i, this.props.variables);
    }).join('');
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fragments: this.getSpaceBufferedFragments(nextProps.definition.fragments)
    });
  }

  componentDidUpdate() {
    // Need to manually update the html to have the cursor span, when it doesn't move
    let html = this.getHtml(this.state.fragments);
    let innerHtml = React.findDOMNode(this).innerHTML;
    if (html !== innerHtml) {
      React.findDOMNode(this).innerHTML = html;
    }
    this.updateCursorLocation();
  }

  render() {
    //
    // TODO - Make this on hover eventually
    //
    let html = this.getHtml(this.state.fragments);
    return (
      <div
        onInput={this.handleInput.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
        onClick={this.handleClick.bind(this)}
        contentEditable='true'
        dangerouslySetInnerHTML={{__html: html}}
      ></div>
    );

  }

  updateCursorLocation() {
    this.moveCursorTo(this.state.cursorFragmentIndex, this.state.cursorOffset);
  }

  moveCursorTo(nodeIndex, offset) {
    if (nodeIndex === null) {
      return;
    }
    let element = React.findDOMNode(this);
    let node = element.childNodes[nodeIndex];

    window.getSelection().removeAllRanges();
    let range = document.createRange();
    range.setStart(node, offset);
    range.setEnd(node, offset);
    window.getSelection().addRange(range);
  }

  moveCursorPosition(dir) {
    let index = this.state.cursorFragmentIndex;
    let offset = this.state.cursorOffset;
    let fragments = this.state.fragments;
    let fragment = fragments[index];

    if (dir === 'right') {
      if (_.isString(fragment) && offset < fragment.length) {
        offset++;
      } else {
        index++;
        offset = 0;
      }

    } else {
      if (_.isString(fragment) && offset > 0) {
        offset--;
      } else {
        index--;
        offset = 0;
        let prevFragment = fragments[index];
        if (_.isString(prevFragment)) {
          offset = prevFragment.length;
        }
      }
    }
    if (index < 0) {
      index = 0;
    } else if (index > fragments.length - 1) {
      index = fragments.length - 1;
    }

    this.setState({
      cursorFragmentIndex: index,
      cursorOffset: offset
    });
  }

  handleClick() {
    let index = this.state.cursorFragmentIndex + 1;
    index = index === this.state.fragments.length ? 0 : index;

    let location = this.getCursorLocation(React.findDOMNode(this));
    console.log('click location', location);

    this.setState({
      cursorFragmentIndex: location.fragmentIndex,
      cursorOffset: location.offset
    });
  }

  handleKeyDown(evt) {
    if (evt.which === 37 || evt.which === 39) {
      let dir = evt.which === 37 ? 'left' : 'right';
      this.moveCursorPosition(dir);
      evt.preventDefault();
    }
    // Don't let this bubble to app that is listening for key presses
    evt.stopPropagation();
  }

  nodeToFragment(node) {
    if (node.hasAttribute && node.hasAttribute('data-variable-id')) {
      let id = node.getAttribute('data-variable-id');
      // The expression editor either treats all possible vector values as is or not
      // If you are in the data list area, you will be vector valued otherwise, don't
      return {id, asVector: this.props.asVector};
    } else if (node.hasAttribute) {
      // Probably a cursor location
      return '';
    } else {
      let unescSpace = f => f.replace(/\u00a0/g, ' ');
      return unescSpace(node.data);
    }
  }

  getCursorNodeOffsetWithinTextFragment(range, element) {
    let node, offset;
    if (range.startContainer === element) {
      // This means the container is not the text
      if (range.startOffset < element.childNodes.length) {
        node = element.childNodes[range.startOffset];
        offset = 0;
      } else {
        node = element.childNodes[element.childNodes.length - 1];
        if (node) {
          //node is guaranteed to be a text node due to the render function
          offset = node.length;
        } else {
          // this case happens when the editor is empty
          offset = 0;
        }
      }
    } else { // range starts in child node
      node = range.startContainer;
      offset = range.startOffset;
    }
    return {node, offset};
  }

  getCursorLocation(element) {
    let fragmentIndex = 0;
    let offset = 0;

    let selection = window.getSelection();
    if (selection) {
      let range = selection.getRangeAt(0);
      if (range) {

        let parentEl = range.startContainer.parentElement;
        if (parentEl.hasAttribute('data-fragment-index')) {

          // We are within a variable pill
          fragmentIndex = +parentEl.getAttribute('data-fragment-index');
          // If we tried to click on the end of the pill, place the curso
          // in the next node
          if (range.startOffset === range.startContainer.length) {
            // Always have a next node because we buffer the variables with space
            fragmentIndex++;
          }
        } else {

          // We are within a text node
          let nodeOffset = this.getCursorNodeOffsetWithinTextFragment(range, element);
          // We are either the index ahead of the previous variable or the first
          let prevEl = nodeOffset.node.previousElementSibling;
          if (prevEl && prevEl.hasAttribute('data-fragment-index')) {
            fragmentIndex = +prevEl.getAttribute('data-fragment-index') + 1;
          }
          offset = nodeOffset.offset;
        }
      }
    }
    return {fragmentIndex, offset};
  }

  // This expects nodes back so that we can process the
  // html... not super user friendly, but useful for parsing out
  // variables from text
  handleInput() {

    let nodes = React.findDOMNode(this).childNodes;
    let newFragments = [];
    for (let i = 0; i < nodes.length; i++) {
      newFragments.push(this.nodeToFragment(nodes[i]));
    }

    // Get the new cursor location from the edit
    let location = this.getCursorLocation(React.findDOMNode(this));

    // Only update the app if the expression is valid
    let newExpression = new Expression(newFragments);
    let value = newExpression.evaluate(this.props.variableValues);
    if (value instanceof Error) {
      console.log('Invalid Expression', value.message);
    } else {
      if (this.props.onChange) {
        this.props.onChange(new Expression(newFragments));
      }
    }

    this.setState({
      cursorFragmentIndex: location.fragmentIndex,
      cursorOffset: location.offset,
      fragments: this.getSpaceBufferedFragments(newFragments)
    });

  }
}

ExpressionEditor.defaultProps = {
  asVector: false
};

ExpressionEditor.propTypes = {
  asVector: React.PropTypes.bool,
  variableValues: React.PropTypes.object.isRequired,
  variables: React.PropTypes.array.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};
