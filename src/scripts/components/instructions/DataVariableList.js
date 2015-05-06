import React from 'react';
import VariablePill from '../VariablePill';
import ExpressionEditor from '../ExpressionEditor';

export default class DataVariableList extends React.Component {

  render() {
    let values = this.props.scalars.map((dataVariable, index) => {
      let value = dataVariable.getValue(this.props.dataValues);
      value = Math.round(value * 100) / 100;
      return (
        <li className='data-variable-list-item' key={index}>
          <VariablePill variable={dataVariable} />
          <ExpressionEditor
            variables={this.props.dataVariables}
            definition={dataVariable.definition} />
          <div>
            {value}
          </div>
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
