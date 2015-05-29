import React from 'react';
import VariablePill from '../VariablePill';
import Papa from 'papaparse';

import DataVariableActions from '../../actions/DataVariableActions';
import DataVariableStore from '../../stores/DataVariableStore';

export default class DataTable extends React.Component {

  render() {
    let {rows, rowValues, maxLength} = this.props.table;
    let {currentLoopIndex} = this.props;

    let headerCells = 'i'.repeat(maxLength + 1).split('').map((_,index) => {
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

        <input
          type='file'
          onChange={this.handleUpload.bind(this)}
          value='Upload CSV' />
      </div>
    );
  }

  handleUpload(e) {
    console.log('UPLOAD CSV...');
    let file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,

      complete: (results, f) => {
        // currently assuming columns are keyed by first row
        console.log('parsing complete: ', f, results);
        var rowMap = new Map();
        // papaparse makes sure all elements have all keys, even
        // if vals are empty
        for (let row of results.data) {
          for (let key of Object.keys(row)) {
            // value is an array of row values
            if (rowMap.has(key)) {
              var val = rowMap.get(key);
              val.push(row[key]);
              rowMap.set(key, val);
            } else {
              rowMap.set(key, [row[key]]);
            }
          }
        }

        rowMap.forEach((value, key, rm) => {
          console.log(rowMap === rm);
          let jsonVal = JSON.stringify(value);
          console.log('json val:', jsonVal);
          let variable = DataVariableStore.generateNewVariable({
            name: key,
            isRow: true,
            definition: jsonVal
          });
          DataVariableActions.appendVariable(variable);
        });
      },

      error: (error, f) => {
        console.log('parse error: ', f, error);
      }
    });
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
