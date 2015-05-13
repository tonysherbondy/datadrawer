import React from 'react';

export default class ContentEditable extends React.Component {

  render() {
    return (
      <div
        {...this.props}
        onInput={this.emitChange.bind(this)}
        onBlur={this.emitChange.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
        contentEditable='true'
        dangerouslySetInnerHTML={{__html: this.props.html}}>
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.html !== React.findDOMNode(this).innerHTML;
  }

  componentDidUpdate() {
    if ( this.props.html !== React.findDOMNode(this).innerHTML ) {
     this.getDOMNode().innerHTML = this.props.html;
    }
  }

  emitChange(evt) {
    var html = React.findDOMNode(this).innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      evt.target = {value: html};
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
