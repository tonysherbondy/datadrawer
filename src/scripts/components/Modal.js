import React from 'react';
import classNames from 'classnames';

class Modal extends React.Component {
  render() {
    let modalClass = classNames('modal', {showing: this.props.isShowing});
    return (
      <div className={modalClass}>
        <div className="modal-dialog">
          <div className="modal-header">
            <h2>{this.props.title}</h2>
            <a onClick={this.handleClose.bind(this)} className="btn-close">×</a>
          </div>

          <div className="modal-body">
            {this.props.children}
          </div>

          <div className="modal-footer">
            <a onClick={this.handleSubmit.bind(this)} className="btn">{this.props.submitTitle}</a>
          </div>
        </div>
      </div>
    );
  }

  handleClose(evt) {
    this.props.onClose();
    evt.preventDefault();
  }

  handleSubmit(evt) {
    this.props.onSubmit();
    evt.preventDefault();
  }
}

Modal.propTypes = {
  title: React.PropTypes.string.isRequired,
  submitTitle: React.PropTypes.string.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired
};

export default Modal;
