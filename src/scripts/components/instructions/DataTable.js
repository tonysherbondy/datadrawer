import React from 'react';
import _ from 'lodash';

import VariablePill from '../VariablePill';
import ExpressionEditorAndScrub from '../ExpressionEditorAndScrub';
import Picture from '../../models/Picture';

class DataTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      hoveredRowIndex: null
    };
  }

  render() {
    let table = this.props.picture.getVariableTableWithValues(this.props.dataValues, this.props.dataVariables);
    let {rows, rowValues, maxLength} = table;
    let {currentLoopIndex} = this.props;

    let headerCells = 'i'.repeat(maxLength + 1).split('').map((dummy, index) => {
      let value = index === 0 ? '' : index - 1;
      let className = index - 1 === currentLoopIndex ? 'current-loop-column' : '';
      return (<th key={index} className={className}>{value}</th>);
    });

    let rowElements = rows.map((row, index) => {
      let cells = rowValues[index].map((v, i) => {
        let displayV = _.isNumber(v) ? Math.round(v * 100) / 100 : v;
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
            <VariablePill picture={this.props.picture} variable={row} />
          </td>
          {cells}
        </tr>
      );
    });

    let addUi = this.props.readOnly ? null : (
      <div>
        <button onClick={this.handleAddVariable.bind(this)}>Add</button>
        <button onClick={this.props.onImport.bind(this)}>Import...</button>
      </div>
    );

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

        {addUi}

      </div>
    );
  }

  getEditableExpression(variable) {
    let variableValues = this.props.dataValues;
    return (
      <ExpressionEditorAndScrub
        picture={this.props.picture}
        asVector={true}
        onChange={this.handleDefinitionChange.bind(this, variable)}
        onEditChange={this.handleEditChange.bind(this)}
        variableValues={variableValues}
        definition={variable.definition} />
    );
  }

  handleDefinitionChange(variable, newDefinition) {
    if (this.props.onDefinitionChange) {
      this.props.onDefinitionChange(variable, newDefinition);
      return;
    }

    let newVariable = variable.cloneWithDefinition(newDefinition);
    // Make sure the new variable hasn't introduced cycle
    if (!newVariable.hasCycle(this.props.dataVariables)) {
      this.context.actions.picture.modifyVariable(this.props.picture, newVariable);
    } else {
      // Force rerender
      // TODO - Right now this is a hack, probably a better way to do this is to flash
      // some error message that makes us rerender anyway
      this.forceUpdate();
    }
  }

  handleEditChange(isEditing) {
    this.setState({isEditing: isEditing});
  }

  handleMouseLeftTable() {
    if (this.state.isEditing) { return; }
    this.setState({hoveredRowIndex: null});
  }

  handleMouseEnterData(index) {
    if (this.state.isEditing) { return; }
    this.setState({hoveredRowIndex: index});
  }

  handleAddVariable() {
    let variable = this.props.picture.generateNewVariable({
      isRow: true,
      definition: '[42]'
    });
    this.context.actions.picture.addVariable(this.props.picture, variable);
  }

}

DataTable.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  })
};

DataTable.propTypes = {
  picture: React.PropTypes.instanceOf(Picture).isRequired,
  readOnly: React.PropTypes.bool,
  onImport: React.PropTypes.func.isRequired,
  isPicturePopup: React.PropTypes.bool,
  variableNameMap: React.PropTypes.object,
  currentLoopIndex: React.PropTypes.number,
  dataVariables: React.PropTypes.array.isRequired,
  dataValues: React.PropTypes.object.isRequired
};

export default DataTable;
