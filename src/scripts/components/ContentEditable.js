import React from 'react';

export default class ContentEditable extends React.Component {

  render() {
    return (
      <span
        {...this.props}
        onInput={this.emitChange.bind(this)}
        onBlur={this.handleBlur.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
        contentEditable='true'
        dangerouslySetInnerHTML={{__html: this.props.html}}>
      </span>
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.html !== React.findDOMNode(this).innerHTML;
  }

  componentDidUpdate() {
    let el = React.findDOMNode(this);
    if ( this.props.html !== el.innerHTML ) {
     el.innerHTML = this.props.html;
    }
  }

  handleBlur(evt) {
    if (this.props.onBlur) {
      this.props.onBlur(evt);
    } else {
      this.emitChange(evt);
    }
  }

  emitChange(evt) {
    let el = React.findDOMNode(this);
    let html = el.innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      evt.target = {value: el.textContent || el.innerText || ''};
      this.props.onChange(evt);
    }
    this.lastHtml = html;
  }

  handleKeyDown(evt) {
    // Don't let this bubble to app that is listening for key presses
    evt.stopPropagation();
  }

}

ContentEditable.propTypes = {
  html: React.PropTypes.string.isRequired
};
