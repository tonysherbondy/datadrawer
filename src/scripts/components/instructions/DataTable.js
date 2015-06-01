import React from 'react';
import VariablePill from '../VariablePill';
import DataVariableActions from '../../actions/DataVariableActions';
import DataVariableStore from '../../stores/DataVariableStore';

export default class DataTable extends React.Component {

  render() {
    let {rows, rowValues, maxLength} = this.props.table;
    let {currentLoopIndex} = this.props;

    let headerCells = 'i'.repeat(maxLength+1).split('').map((_,index) => {
      let value = index === 0 ? '' : index - 1;
      let className = index - 1 === currentLoopIndex ? 'current-loop-column' : '';
      return (<th key={index} className={className}>{value}</th>);
    });

    let rowElements = rows.map((row, index) => {
      let cells = rowValues[index].map((v, i) => {
          let displayV = Math.round(v * 100) / 100;
          return (<td key={i}>{displayV}</td>);
      });
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
        <table className="data-table">
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
  rowVariables: React.PropTypes.array,
  dataValues: React.PropTypes.object
};

DataTable.defaultProps = {
  rowVariables: [],
  dataValues: {}
};
