import React from 'react';
import ReactColorPicker from './react-colorpickr/ReactColorPickr';
require('../../styles/react-colorpickr.css');

export default class ColorPicker extends React.Component {

  render() {
    return (
      <div className="color-picker-container">
        <ReactColorPicker
          reset={true}
          value={this.props.color}
          onChange={this.props.handleChange} />
      </div>
    );
  }

}

ColorPicker.propTypes = {
  color: React.PropTypes.string.isRequired
};
