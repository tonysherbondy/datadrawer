import React from 'react';
import DataVariableActions from '../../actions/DataVariableActions';

export default class DataTable extends React.Component {

  render() {
    let {rows, rowValues, maxLength} = this.props.table;

    let headerCells = 'i'.repeat(maxLength+1).split('').map((_,index) => {
      let value = index === 0 ? '' : index - 1;
      return (<th key={index}>{value}</th>);
    });

    let rowElements = rows.map((row, index) => {
      let values = rowValues[index];
      return (
        <tr key={index}>
          <td>{row.name}</td>
          {values.map((v, i) => (<td key={i}>{v}</td>))}
        </tr>
      );
    });

    return (
      <table>
        <thead>
          <tr>
            {headerCells}
          </tr>
        </thead>
        <tbody>
          {rowElements}
        </tbody>
      </table>
    );
  }

}

DataTable.propTypes = {
  rowVariables: React.PropTypes.array,
  dataValues: React.PropTypes.object
};

DataTable.defaultProps = {
  rowVariables: [],
  dataValues: {}
};