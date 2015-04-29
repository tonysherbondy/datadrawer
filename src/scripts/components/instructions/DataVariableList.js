import React from 'react';

export default class DataVariableList extends React.Component {

  render() {
    let values = this.props.dataVariables.map((dataVariable, index) => {
      let v = dataVariable.getValue(this.props.dataValues);
      v = Math.round(v * 100) / 100;
      return (
        <li className='data-variable-list-item' key={index}>
          {dataVariable.name} ({v})
        </li>
      );
    });
    return (
      <ul className='dataVariables-list'>
        {values}
      </ul>
    );
  }

}

DataVariableList.propTypes = {
  dataVariables: React.PropTypes.array,
  dataValues: React.PropTypes.object
};

DataVariableList.defaultProps = {
  dataVariables: [],
  dataValues: {}
};
