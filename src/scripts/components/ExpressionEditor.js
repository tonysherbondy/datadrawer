import React from 'react';
import ContentEditable from './ContentEditable';

export default class ExpressionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      html: '<b>Hello <i>World</i></b>'
    };
  }

  render() {
    return (
      <ContentEditable html={this.state.html} onChange={this.handleChange.bind(this)} />
    );
  }

  handleChange(evt) {
    this.setState({html: evt.target.value});
  }
}
