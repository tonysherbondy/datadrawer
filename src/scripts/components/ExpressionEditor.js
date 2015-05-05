import React from 'react';
import ContentEditable from './ContentEditable';

export default class ExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDefinition: false,
      definitionHtml: this.getHtml(this.props.definition)
    };
  }

  getHtml(definition) {
    return definition.join('');
  }

  render() {
    if (this.state.showDefinition) {
      console.log('showDefinition');
      return (
        <ContentEditable
          onMouseOut={this.handleMouseOut.bind(this)}
          html={this.state.definitionHtml}
          onChange={this.handleChange.bind(this)} />
      );
    } else {
      return (
        <div onMouseOver={this.handleMouseOver.bind(this)}>
          {this.props.value}
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
  value: React.PropTypes.number,
  definition: React.PropTypes.array
};
