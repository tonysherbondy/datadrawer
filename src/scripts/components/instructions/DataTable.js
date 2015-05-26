import React from 'react';
import VariablePill from '../VariablePill';

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
  currentLoopIndex: React.PropTypes.number,
  rowVariables: React.PropTypes.array,
  dataValues: React.PropTypes.object
};

DataTable.defaultProps = {
  rowVariables: [],
  dataValues: {}
};
