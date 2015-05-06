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
      showDefinition: false
    };
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
        fragmentString = VariablePill.getHtmlStringFromFragment(fragment, this.props.variables);
      }
      html += fragmentString;
    });

    return html;
  }

  shouldComponentUpdate(nextProps) {
    let html = this.getHtml(nextProps.definition.fragments);
    return html !== React.findDOMNode(this).innerHTML;
  }

  componentDidUpdate() {
    let html = React.findDOMNode(this).innerHTML;
    if (this.props.html !== html) {
      html = this.props.html;
    }
  }

  updateCursorLocation() {
    let marker = React.findDOMNode(this).getElementById(VariablePill.cursorLocationId);
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

  render() {
    //
    // TODO - Make this on hover eventually
    //
    let html = this.getHtml(this.props.definition.fragments);
    return (
      <div
        onInput={this.handleChange.bind(this)}
        onBlur={this.handleChange.bind(this)}
        contentEditable='true'
        dangerouslySetInnerHTML={{__html: html}}
      ></div>
    );

  }

  nodeToFragment(node) {
    if (node.hasAttribute && node.hasAttribute('data-variable-id')) {
      let id = node.getAttribute('data-variable-id');
      return {id};
    } else {
      return node.data;
    }
  }

  // This expects nodes back so that we can process the
  // html... not super user friendly, but useful for parsing out
  // variables from text
  handleChange(nodes) {
    let fragments = [];
    for (let i = 0; i < nodes.length; i++) {
      let fragment = this.nodeToFragment(nodes[i]);
      if (fragment) {
        fragments.push(fragment);
      }
    }
    console.log('should update definition', fragments);
  }
}

ExpressionEditor.propTypes = {
  variables: React.PropTypes.array.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};
