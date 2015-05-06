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

  emitChange() {
    let element = React.findDOMNode(this);
    let html = element.innerHTML;
    if (html !== this.lastHtml) {
      if (this.props.onChangeNodes) {
        // The handler wants the actual DOM nodes sent
        this.props.onChangeNodes(element.childNodes);
      } else if (this.props.onChange) {
        // The handler wants the html string sent
        this.props.onChange(html);
      }
    }
    this.lastHtml = html;
  }

}
