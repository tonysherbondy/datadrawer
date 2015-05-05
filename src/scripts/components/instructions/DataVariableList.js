import React from 'react';
import VariablePill from '../VariablePill';
import ExpressionEditor from '../ExpressionEditor';

export default class DataVariableList extends React.Component {

  render() {
    let values = this.props.dataVariables.map((dataVariable, index) => {
      let value = dataVariable.getValue(this.props.dataValues);
      value = Math.round(value * 100) / 100;
      return (
        <li className='data-variable-list-item' key={index}>
          <VariablePill variable={dataVariable} />
          <ExpressionEditor
            variableValues={this.props.dataValues}
            definition={dataVariable.definition} />
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
