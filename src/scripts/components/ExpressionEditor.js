import React from 'react';
import _ from 'lodash';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';
import $ from 'jquery';

export default class ExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorFragmentIndex: {start: null, end: null},
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
        onDrop={this.handleDrop.bind(this)}
        onDragOver={this.handleDragOver.bind(this)}
        className='expression-editor'
        onClick={this.handleClick.bind(this)}
        onInput={this.handleInput.bind(this)}
        onBlur={this.handleBlur.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
        onMouseUp={this.handleMouseUp.bind(this)}
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
      return VariablePill.getHtmlStringFromFragment(fragment, i, this.props.picture);
    }).join('');
  }

  nodeToFragment(node) {
    if (node.hasAttribute && node.hasAttribute('data-variable-id')) {
      let id = node.getAttribute('data-variable-id');
      let prop = node.getAttribute('data-variable-prop');
      // The expression editor either treats all possible vector values as is or not
      // If you are in the data list area, you will be vector valued otherwise, don't
      return {id, prop, asVector: this.props.asVector};
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
    if (nodeIndex.start === null) {
      return;
    }
    let element = React.findDOMNode(this);
    let startNode = element.childNodes[nodeIndex.start];
    let endNode = element.childNodes[nodeIndex.end];

    try {
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.setStart(startNode, offset.start);
      range.setEnd(endNode, offset.end);
      window.getSelection().addRange(range);
    }
    catch (err) {
      console.warn('error moving cursor', err);
      // TODO - Perhaps remove this and explore why this fails sometimes
      this.setState({
        cursorFragmentIndex: {start: null, end: null},
        cursorOffset: {start: 0, end: 0}
      });
    }
  }

  // fragmentIndex is one location, this will remove any range selection
  moveCursorPosition(dir, location) {
    let {fragmentIndex, offset} = location;
    let fragments = this.state.fragments;
    let fragment = fragments[fragmentIndex];

    let position;
    if (dir === 'right') {
      position = offset.end;
      if (_.isString(fragment) && position < fragment.length) {
        position++;
      } else if (fragmentIndex < fragments.length - 1) {
        fragmentIndex = _.findIndex(fragments, (f, i) => i > fragmentIndex && _.isString(f));
        position = 0;
      }

    } else {
      position = offset.start;
      if (_.isString(fragment) && position > 0) {
        position--;
      } else if (fragmentIndex > 0) {
        fragmentIndex = _.findIndex(fragments, (f, i) => i < fragmentIndex && _.isString(f));
        position = fragments[fragmentIndex].length;
      }
    }

    this.setState({
      cursorFragmentIndex: {start: fragmentIndex, end: fragmentIndex},
      cursorOffset: {start: position, end: position}
    });
  }

  getCursorNodeOffsetWithinTextFragment(fragContainer, fragOffset, element) {
    // Leave this if the range starts in child node
    let node = fragContainer;
    let offset = fragOffset;

    if (fragContainer === element) {
      // This means the container is not the text
      if (fragOffset < element.childNodes.length) {
        node = element.childNodes[fragOffset];
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
    }
    return {node, offset};
  }

  getIndexOffsetForContainerOffset(container, offset, element) {
    let fragmentIndex = 0;
    let fragmentOffset = 0;

    let parentElement = container.parentElement;
    if (parentElement.hasAttribute('data-fragment-index')) {
      // We are within a variable pill
      fragmentIndex = +parentElement.getAttribute('data-fragment-index');
      // If we tried to click on the end of the pill, place the curso
      // in the next node
      if (offset === container.length) {
        // Always have a next node because we buffer the variables with space
        fragmentIndex++;
      }
    } else {
      // We are within a text node
      let nodeOffset = this.getCursorNodeOffsetWithinTextFragment(container, offset, element);
      // We are either the index ahead of the previous variable or the first
      let prevEl = nodeOffset.node.previousElementSibling;
      if (prevEl && prevEl.hasAttribute('data-fragment-index')) {
        fragmentIndex = +prevEl.getAttribute('data-fragment-index') + 1;
      }
      fragmentOffset = nodeOffset.offset;
    }
    return {fragmentIndex, fragmentOffset};
  }

  getCursorLocation(element) {
    let selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      if (range) {
        let {fragmentIndex,
             fragmentOffset} = this.getIndexOffsetForContainerOffset(range.startContainer, range.startOffset, element);
        return {
          fragmentIndex,
          offset: {start: fragmentOffset, end: fragmentOffset}
        };
      }
    }
    return {
      fragmentIndex: 0,
      offset: {start: 0, end: 0}
    };
  }

  getRangeLocation(element) {
    let selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      if (range) {
        let start = this.getIndexOffsetForContainerOffset(range.startContainer, range.startOffset, element);
        let end = this.getIndexOffsetForContainerOffset(range.endContainer, range.endOffset, element);
        return {
          cursorFragmentIndex: {start: start.fragmentIndex, end: end.fragmentIndex},
          cursorOffset: {start: start.fragmentOffset, end: end.fragmentOffset}
        };
      }
    }
    return {
      cursorFragmentIndex: {start: 0, end: 0},
      cursorOffset: {start: 0, end: 0}
    };
  }




  //
  ////////////////// HANDLE EVENTS //////////////////
  //
  handleBlur() {
    // Don't think we need this anymore, but leaving commented out to remind
    // If this is in here this is problematic as it will remove the highlighted
    // text when we blur to drag and drop something in
    //this.setState({cursorFragmentIndex: {start: null, end: null}});
    if (this.props.handleBlur) {
      this.props.handleBlur();
    }
  }

  // TODO - for some reason if the editor contains a variable then the text
  // gets unselected before we even start the drag
  handleDragOver(evt) {
    let selection = window.getSelection();
    if (this.isSelectingRangeInComponent(selection)) {
      evt.preventDefault();
    }
  }

  handleDrop(evt) {
    let selection = window.getSelection();
    // TODO - maybe we just want to deselect the other text
    // Make sure we don't drop when the selection is somewhere else
    if(!this.isSelectionInComponent(selection)) {
      evt.preventDefault();
    } else if (this.isSelectingRangeInComponent(selection)) {
      let range = selection.getRangeAt(0);
      range.deleteContents();
      let dropData = evt.dataTransfer.getData('text/html');
      let varId = _.last(/data-variable-id="([a-zA-Z_]*)"/.exec(dropData));
      let varName = _.last(/>([a-zA-Z\s]+)<\/span>/.exec(dropData));
      let varNode = document.createElement('span');
      varNode.setAttribute('data-variable-id', varId);
      varNode.innerHTML = varName;
      range.insertNode(varNode);
      this.handleInput();
    }
  }

  isSelectionInComponent(selection) {
    if (selection && selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      return range && $.contains(React.findDOMNode(this), range.startContainer);
    }
    return false;
  }

  isSelectingRangeInComponent(selection) {
    if (this.isSelectionInComponent(selection)) {
      let range = selection.getRangeAt(0);
      let withinOneContainer = range.startContainer === range.endContainer;
      let rangeLength = range.endOffset - range.startOffset;
      return !withinOneContainer || rangeLength !== 0;
    }
    return false;
  }

  handleMouseUp() {
    let selection = window.getSelection();
    if (this.isSelectingRangeInComponent(selection)) {
      this.setState(this.getRangeLocation(React.findDOMNode(this)));
    }
  }

  handleKeyDown(evt) {
    if (evt.which === 37 || evt.which === 39) {
      let dir = evt.which === 37 ? 'left' : 'right';
      let location = this.getCursorLocation(React.findDOMNode(this));
      this.moveCursorPosition(dir, location);
      evt.preventDefault();
    } else if (evt.which === 13) {
      // Let handler know when enter is pressed
      if (this.props.handleEnterKey) {
        this.props.handleEnterKey(evt);
      }
    }
    // Don't let this bubble to app that is listening for key presses
    evt.stopPropagation();
  }

  // TODO - May be smarter for instruction list item to ignore when we click on
  // this instead...
  // Clicking in the expression editor shouldn't trigger things upstream
  handleClick(evt) {
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
      cursorFragmentIndex: {start: location.fragmentIndex, end: location.fragmentIndex},
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
  picture: React.PropTypes.object.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};
