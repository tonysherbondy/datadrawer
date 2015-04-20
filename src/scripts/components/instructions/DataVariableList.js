import React from 'react';
import DataVariableActions from '../../actions/DataVariableActions';

export default class DataVariableList extends React.Component {

  render() {
    return (
      <ul className='dataVariables-list'>
        {this.props.dataVariables.map((dataVariable, index) => {
          return (
              <li className='data-variable-list-item' key={index}>
                {dataVariable.name} ({dataVariable.getValue(this.props.dataValues)})
              </li>
          );
        })}
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
