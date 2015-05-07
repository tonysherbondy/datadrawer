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
    let html = '';

    if (this.state.cursorFragmentIndex === -1) {
      html += this.getCursorSpan();
    }

    fragments.forEach((fragment, i) => {
      let fragmentString = '';

      if (_.isString(fragment)) {
        let escSpace = f => f.replace(/ /g, '&nbsp;');
        // String fragment
        if (this.state.cursorFragmentIndex === i) {
          let offset = this.state.cursorOffset;
          let sides = [fragment.slice(0, offset), fragment.slice(offset)];
          fragmentString = sides.map(escSpace).join(this.getCursorSpan());
        } else {
          fragmentString = escSpace(fragment);
        }
      } else {
        // Variable fragment
        let cursorSpan = '';
        if (this.state.cursorFragmentIndex === i) {
          cursorSpan = this.getCursorSpan();
        }
        fragmentString = cursorSpan + VariablePill.getHtmlStringFromFragment(fragment, this.props.variables);
      }
      html += fragmentString;
    });

    return html;
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
    let marker = document.getElementById(VariablePill.cursorLocationId);
    if (marker) {
      this.moverCursorToBefore(marker);
      marker.remove();
    }
  }

  moverCursorToBefore(node) {
    window.getSelection().removeAllRanges();
    let range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 0);
    window.getSelection().addRange(range);
  }

  moveCursorPosition(dir) {
    console.log('Please move cursor', dir);
  }

  handleClick() {
    let index = this.state.cursorFragmentIndex + 1;
    index = index === this.state.fragments.length ? 0 : index;
    console.log('setting index', index, this.state.fragments);

    this.setState({
      cursorFragmentIndex: index,
      cursorOffset: 0
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

  getCursorLocation(element) {
    let selection = window.getSelection();
    let node, offset;
    if (selection) {
      let range = selection.getRangeAt(0);
      if (range) {
        if (range.startContainer === element) {
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
      }
    }
    return {node, offset};
  }

  // This expects nodes back so that we can process the
  // html... not super user friendly, but useful for parsing out
  // variables from text
  handleChange() {
    console.log('Need to handle change');

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
