import React from 'react';
import classNames from 'classnames';


export default class KeyboardControlsList extends React.Component {
  render() {
    let getControlListingForHandler = (handler) => {
      let className = classNames({
        // TODO: (nhan) check this in a more robust way
        // perhaps add a separate key to each handler corresponding to
        // drawing mode
        'active-key': (this.props.drawingMode === handler.description)
      });

      return (
        <tr key={handler.keyDescription} className={className}>
          <td className='keyboard-control-description'>{handler.description}</td>
          <td className='keyboard-control-key'>
            <strong>{handler.keyDescription}</strong>
          </td>
        </tr>
      );
    };

    return (
      <table className={this.props.className}>
        {this.props.keyEventManager.handlers.map(getControlListingForHandler)}
      </table>
    );
  }
}

KeyboardControlsList.propTypes = {
  keyEventManager: React.PropTypes.object.isRequired
};
