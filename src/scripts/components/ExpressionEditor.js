import React from 'react';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';

export default class ExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDefinition: false
    };
  }

  getHtml(fragments) {
    return fragments.map( fragment => {
      if (!fragment.id) {
        return fragment;
      } else {
        let id = fragment.id;
        let name = VariablePill.getVariableName(this.props.variables, id);
        return VariablePill.getHtmlString({id, name});
      }
    })
    .concat([`<span id="${VariablePill.cursorLocationId}"></span>`])
    .join('');
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

  render() {
    //
    // TODO - Make this on hover eventually
    //
    let html = this.getHtml(this.props.definition.fragments);
    return (
      <div
        {...this.props}
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
