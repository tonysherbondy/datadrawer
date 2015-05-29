import React from 'react';
import VariablePill from '../VariablePill';
import ExpressionEditorAndScrub from '../ExpressionEditorAndScrub';
import DataVariableActions from '../../actions/DataVariableActions';
import DataVariableStore from '../../stores/DataVariableStore';

export default class DataVariableList extends React.Component {

  render() {
    let values = this.props.scalars.map((dataVariable, index) => {
      let value = dataVariable.getValue(this.props.dataValues);
      value = Math.round(value * 100) / 100;

      return (
        <li className='data-variable-list-item' key={index}>
          <VariablePill variable={dataVariable} />
          <ExpressionEditorAndScrub
            asVector={true}
            onChange={this.handleDefinitionChange.bind(this, dataVariable)}
            variables={this.props.dataVariables}
            variableValues={this.props.dataValues}
            definition={dataVariable.definition} />
          <div className='dataVariable-value'>
            {value}
          </div>
        </li>
      );
    });
    return (
      <div className="dataVariables-list-container">
        <ul className='dataVariables-list'>
          {values}
        </ul>
        <button onClick={this.handleAddVariable.bind(this)}>Add</button>
      </div>
    );
  }

  handleDefinitionChange(variable, newDefinition) {
    let newVariable = variable.cloneWithDefinition(newDefinition);
    // Make sure the new variable hasn't introduced cycle
    if (!newVariable.hasCycle(this.props.dataVariables)) {
      DataVariableActions.modifyVariable(newVariable);
    } else {
      // Force rerender
      // TODO - Right now this is a hack, probably a better way to do this is to flash
      // some error message that makes us rerender anyway
      this.forceUpdate();
    }
  }

  handleAddVariable() {
    let variable = DataVariableStore.generateNewVariable({
      isRow: false,
      definition: '42'
    });
    DataVariableActions.appendVariable(variable);
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
