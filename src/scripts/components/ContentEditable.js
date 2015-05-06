import React from 'react';

export default class ContentEditable extends React.Component {

  render() {
    return (
      <div
        {...this.props}
        onInput={this.emitChange.bind(this)}
        onBlur={this.emitChange.bind(this)}
        contentEditable='true'
        dangerouslySetInnerHTML={{__html: this.props.html}}
      ></div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.html !== React.findDOMNode(this).innerHTML;
  }

  componentDidUpdate() {
    let html = React.findDOMNode(this).innerHTML;
    if (this.props.html !== html) {
      html = this.props.html;
    }
  }

  emitChange(evt) {
    let element = React.findDOMNode(this);
    let html = element.innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      evt.target = {value: html};
      this.props.onChange(element.childNodes);
    }
    this.lastHtml = html;
  }

}
