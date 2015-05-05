import React from 'react';
import ContentEditable from './ContentEditable';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';

export default class ExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDefinition: false,
      definitionHtml: this.getHtml(this.props.definition)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      definitionHtml: this.getHtml(nextProps.definition)
    });
  }

  getHtml(definition) {
    let fragments = definition.fragments;
    return fragments.map( fragment => {
      if (!fragment.id) {
        return fragment;
      } else {
        let id = fragment.id;
        // TODO - Need a general display name lookup for variables
        let displayName = id;
        return `<span class="variable-pill" contenteditable="false" ` +
          `draggable="true" data-variable-id="${id}">${displayName}</span>`;
      }
    })
    .concat([`<span id="${VariablePill.cursorLocationId}"></span>`])
    .join('');
  }

  render() {
    let definition = this.props.definition;
    let value = definition.evaluate(this.props.variableValues);
    if (isFinite(value)) {
      value = Math.round(value * 100) / 100;
    }

    return (
      <div>
        <ContentEditable
          html={this.state.definitionHtml}
          onChange={this.handleChange.bind(this)} />

        <div>
          {value}
        </div>
      </div>
    );

    // TODO - Make this on hover eventually
    //if (this.state.showDefinition) {
      //return (
        //<ContentEditable
          //onMouseOut={this.handleMouseOut.bind(this)}
          //html={this.state.definitionHtml}
          //onChange={this.handleChange.bind(this)} />
      //);
    //} else {
      //let value = definition.evaluate(this.props.variableValues);
      //if (isFinite(value)) {
        //value = Math.round(value * 100) / 100;
      //}
      //return (
        //<div onMouseOver={this.handleMouseOver.bind(this)}>
          //{value}
        //</div>
      //);
    //}
  }

  handleMouseOver() {
    this.setState({showDefinition: true});
  }

  handleMouseOut() {
    this.setState({showDefinition: false});
  }

  handleChange(evt) {
    this.setState({definitionHtml: evt.target.value});
  }
}

ExpressionEditor.propTypes = {
  variableValues: React.PropTypes.object.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};
