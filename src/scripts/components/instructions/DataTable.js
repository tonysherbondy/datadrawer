import React from 'react';
import _ from 'lodash';
import VariablePill from '../VariablePill';
import DataVariableActions from '../../actions/DataVariableActions';
import DataVariableStore from '../../stores/DataVariableStore';
import ExpressionEditorAndScrub from '../ExpressionEditorAndScrub';

export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredRowIndex: null
    };
  }

  render() {
    let {rows, rowValues, maxLength} = this.props.table;
    let {currentLoopIndex} = this.props;

    let headerCells = 'i'.repeat(maxLength + 1).split('').map((dummy, index) => {
      let value = index === 0 ? '' : index - 1;
      let className = index - 1 === currentLoopIndex ? 'current-loop-column' : '';
      return (<th key={index} className={className}>{value}</th>);
    });

    let rowElements = rows.map((row, index) => {
      let cells = rowValues[index].map((v, i) => {
        let displayV = Math.round(v * 100) / 100;
        return (<td key={i} onMouseEnter={this.handleMouseEnterData.bind(this, index)}>{displayV}</td>);
      });

      // For the hovered row, show the editable expression
      if (this.state.hoveredRowIndex === index) {
        let maxCols = _.max(rowValues.map(r => r.length));
        let editableExpression = this.getEditableExpression(row);
        cells = (
          <td key={`hovered_${index}`} colSpan={maxCols}>{editableExpression}</td>
        );
      }
      return (
        <tr key={index}>
          <td key={0} className='table-name-col'>
            <VariablePill variable={row} />
          </td>
          {cells}
        </tr>
      );
    });

    return (
      <div className="table-container">
        <table onMouseLeave={this.handleMouseLeftTable.bind(this)} className="data-table">
          <thead>
            <tr>
              {headerCells}
            </tr>
          </thead>
          <tbody>
            {rowElements}
          </tbody>
        </table>
        <button onClick={this.handleAddVariable.bind(this)}>Add</button>
      </div>
    );
  }

  getEditableExpression(variable) {
    let variables = this.props.dataVariables;
    let variableValues = this.props.dataValues;
    return (
      <ExpressionEditorAndScrub
        asVector={true}
        onChange={this.handleDefinitionChange.bind(this, variable)}
        variables={variables}
        variableValues={variableValues}
        definition={variable.definition} />
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

  handleMouseLeftTable() {
    this.setState({hoveredRowIndex: null});
  }

  handleMouseEnterData(index) {
    this.setState({hoveredRowIndex: index});
  }

  handleAddVariable() {
    let variable = DataVariableStore.generateNewVariable({
      isRow: true,
      definition: '[42]'
    });
    DataVariableActions.appendVariable(variable);
  }

}

DataTable.propTypes = {
  currentLoopIndex: React.PropTypes.number,
  table: React.PropTypes.object.isRequired,
  dataVariables: React.PropTypes.array.isRequired,
  dataValues: React.PropTypes.object.isRequired
};
