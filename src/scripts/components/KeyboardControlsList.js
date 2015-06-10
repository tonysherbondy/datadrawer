import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';


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

    let groups = _.groupBy(this.props.keyEventManager.handlers, (h) => {
      return h.group ? h.group : 'other';
    });

    return (
      <div className={this.props.className}>
        {
          Object.keys(groups).map(function (group) {
            return (
              <table key={group} className='keyboard-control-group'>
                <tr><td><u>{group.toUpperCase()}</u></td></tr>
                {groups[group].map(getControlListingForHandler)}
              </table>
            );
          })
        }
      </div>
    );
  }
}

KeyboardControlsList.propTypes = {
  keyEventManager: React.PropTypes.object.isRequired
};
