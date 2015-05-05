import React from 'react';
import ContentEditable from './ContentEditable';
import Expression from '../models/Expression';

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
    return definition.fragments.join('');
  }

  render() {
    let definition = this.props.definition;
    if (this.state.showDefinition) {
      return (
        <ContentEditable
          onMouseOut={this.handleMouseOut.bind(this)}
          html={this.state.definitionHtml}
          onChange={this.handleChange.bind(this)} />
      );
    } else {
      let value = definition.evaluate(this.props.variableValues);
      if (isFinite(value)) {
        value = Math.round(value * 100) / 100;
      }
      return (
        <div onMouseOver={this.handleMouseOver.bind(this)}>
          {value}
        </div>
      );
    }
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
