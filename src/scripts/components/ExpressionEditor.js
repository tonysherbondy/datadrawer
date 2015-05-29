import React from 'react';
import _ from 'lodash';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';

export default class ExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorFragmentIndex: null,
      cursorOffset: {start: 0, end: 0},
      fragments: this.getSpaceBufferedFragments(props.definition.fragments),
      showDefinition: false
    };
  }


  //
  ////////////////// LIFECYCLE METHODS //////////////////
  //

  render() {
    //
    // TODO - Make this on hover eventually
    //
    let html = this.getHtml(this.state.fragments);
    return (
      <div
        className='expression-editor'
        onInput={this.handleInput.bind(this)}
        onBlur={this.handleBlur.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
        contentEditable='true'
        dangerouslySetInnerHTML={{__html: html}}
      ></div>
    );
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




  //
  ////////////////// FRAGMENT-HTML MODEL //////////////////
  //

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


  getHtml(fragments) {
    let escSpace = f => f.replace(/ /g, '&nbsp;');
    return fragments.map((fragment, i) => {
      if (_.isString(fragment)) {
        return escSpace(fragment);
      }
      return VariablePill.getHtmlStringFromFragment(fragment, i, this.props.variables);
    }).join('');
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





  //
  ////////////////// HANDLE CURSOR LOCATION //////////////////
  //

  updateCursorLocation() {
    this.moveCursorTo(this.state.cursorFragmentIndex, this.state.cursorOffset);
  }

  moveCursorTo(nodeIndex, offset) {
    if (nodeIndex === null) {
      return;
    }
    let element = React.findDOMNode(this);
    let node = element.childNodes[nodeIndex];

    try {
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.setStart(node, offset.start);
      range.setEnd(node, offset.end);
      window.getSelection().addRange(range);
    }
    catch (err) {
      console.warn('error moving cursor', err);
      // TODO - Perhaps remove this and explore why this fails sometimes
      this.setState({
        cursorFragmentIndex: null,
        cursorOffset: {start: 0, end: 0}
      });
    }
  }

  moveCursorPosition(dir, location) {
    let {fragmentIndex, offset} = location;
    let fragments = this.state.fragments;
    let fragment = fragments[fragmentIndex];

    let position;
    if (dir === 'right') {
      position = offset.end;
      if (_.isString(fragment) && position < fragment.length) {
        position++;
      } else {
        fragmentIndex++;
        position = 0;
      }

    } else {
      position = offset.start;
      if (_.isString(fragment) && position > 0) {
        position--;
      } else {
        fragmentIndex--;
        position = 0;
        let prevFragment = fragments[fragmentIndex];
        if (_.isString(prevFragment)) {
          position = prevFragment.length;
        }
      }
    }

    if (fragmentIndex < 0) {
      fragmentIndex = 0;
    } else if (fragmentIndex > fragments.length - 1) {
      fragmentIndex = fragments.length - 1;
    }

    this.setState({
      cursorFragmentIndex: fragmentIndex,
      cursorOffset: {start: position, end: position}
    });
  }

  getCursorNodeOffsetWithinTextFragment(range, element) {
    let node, offset;
    if (range.startContainer === element) {
      // This means the container is not the text
      if (range.startOffset < element.childNodes.length) {
        node = element.childNodes[range.startOffset];
        offset = {start: 0, end: 0};
      } else {
        node = element.childNodes[element.childNodes.length - 1];
        if (node) {
          //node is guaranteed to be a text node due to the render function
          offset = {start: node.length, end: node.length};
        } else {
          // this case happens when the editor is empty
          offset = {start: 0, end: 0};
        }
      }
    } else { // range starts in child node
      node = range.startContainer;
      offset = {start: range.startOffset, end: range.endOffset};
    }
    return {node, offset};
  }

  getCursorLocation(element) {
    let fragmentIndex = 0;
    let offset = {start: 0, end: 0};

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






  //
  ////////////////// HANDLE EVENTS //////////////////
  //
  handleBlur() {
    // Set our cursor index to null so that we don't update
    // the cursor even though we aren't focused
    this.setState({cursorFragmentIndex: null});
    if (this.props.handleBlur) {
      this.props.handleBlur();
    }
  }

  handleKeyDown(evt) {
    if (evt.which === 37 || evt.which === 39) {
      let dir = evt.which === 37 ? 'left' : 'right';
      let location = this.getCursorLocation(React.findDOMNode(this));
      this.moveCursorPosition(dir, location);
      evt.preventDefault();
    }
    // Don't let this bubble to app that is listening for key presses
    evt.stopPropagation();
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
