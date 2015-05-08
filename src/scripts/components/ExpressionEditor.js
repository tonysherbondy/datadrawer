import React from 'react';
import _ from 'lodash';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';

 // node is text node
//function isTextNode(node) {
  //return node.nodeType === 3;
//}

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
        onInput={this.handleChange.bind(this)}
        onBlur={this.handleChange.bind(this)}
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
      }

    } else {
      if (_.isString(fragment) && offset > 0) {
        offset--;
      } else {
        index--;
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
      return {id};
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
  handleChange() {
    console.log('Need to handleChange');

    //// TODO - why do this here?
    //this.updateCursorLocation();

    //let nodes = React.findDOMNode(this).childNodes;
    //let cursorLocation = this.getCursorLocation();
    //// cursorFragmentIndex === -1 means the editor is empty
    //let cursorFragmentIndex = -1;
    //let cursorOffset = cursorLocation.offset;

    //// make sure we always have a text fragment at the start
    //// this is so the cursor will appear if it is before a variable
    //let lastFragment = ' ';
    //if (_.isEmpty(nodes) || isTextNode(nodes[0])) {
      //lastFragment = '';
    //}

    //let newFragments = [];
    //for (let i = 0; i < nodes.length; i++) {
      //// if current node is where cursor is located save the index
      //// and compute the correct offset
      //if (cursorLocation.node === nodes[i]) {
        //if (_.isString(lastFragment)) {
          //cursorOffset = cursorOffset + lastFragment.length;
          //cursorFragmentIndex = newFragments.length;
        //} else {
          //cursorOffset = cursorOffset;
          //// we will be pushing lastFragment since
          //// the node type of fragment and lastfragment are different
          //cursorFragmentIndex = newFragments.length + 1;
        //}
      //}

      //let fragment = this.nodeToFragment(nodes[i]);
      //if (_.isString(lastFragment) && _.isString(fragment)) {
        //// consolidate consecutive string nodes
        //lastFragment = lastFragment + fragment;
      //} else if (!_.isString(lastFragment) && !_.isString(fragment)) {
        //// insert space in between consecutive variables
        //newFragments.push(lastFragment);
        //newFragments.push(' ');
        //lastFragment = fragment;
      //} else {
        //newFragments.push(lastFragment);
        //lastFragment = fragment;
      //}
    //}
    //newFragments.push(lastFragment);
    //if (!_.isString(lastFragment)) {
      //newFragments.push(' ');
    //}

    //if (this.props.onChange) {
      //this.props.onChange(new Expression(newFragments));
    //}

    //this.setState({
      //cursorFragmentIndex: cursorFragmentIndex,
      //cursorOffset: cursorOffset,
      //fragments: this.getSpaceBufferedFragments(newFragments)
    //});

    //console.log('should update definition', newFragments);
  }
}

ExpressionEditor.propTypes = {
  variables: React.PropTypes.array.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};
