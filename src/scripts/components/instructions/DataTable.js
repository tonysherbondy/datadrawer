import React from 'react';
import VariablePill from '../VariablePill';

export default class DataTable extends React.Component {

  render() {
    let {rows, rowValues, maxLength} = this.props.table;

    let headerCells = 'i'.repeat(maxLength+1).split('').map((_,index) => {
      let value = index === 0 ? '' : index - 1;
      return (<th key={index}>{value}</th>);
    });

    let rowElements = rows.map((row, index) => {
      let cells = rowValues[index].map((v, i) => {
          let displayV = Math.round(v * 100) / 100;
          return (<td key={i}>{displayV}</td>);
      });
      return (
        <tr key={index}>
          <td key={0}>
            <VariablePill variable={row} />
          </td>
          {cells}
        </tr>
      );
    });

    return (
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
