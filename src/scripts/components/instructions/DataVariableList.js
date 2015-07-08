import React from 'react';
import _ from 'lodash';
import VariablePill from '../VariablePill';
import ExpressionEditorAndScrub from '../ExpressionEditorAndScrub';
import ColorExpressionEditor from '../ColorExpressionEditor';
import PictureActions from '../../actions/PictureActions';

export default class DataVariableList extends React.Component {

  render() {
    let {scalars} = this.props.dataVariables.reduce((map, d) => {
      let type = d.isRow ? 'vectors' : 'scalars';
      map[type].push(d);
      return map;
    }, {scalars: [], vectors: []});

    let values = scalars.map((dataVariable, index) => {
      let value = dataVariable.getValue(this.props.dataValues);
      if (_.isNumber(value)) {
        value = Math.round(value * 100) / 100;
      }

      // Allow for overriding variable names
      let {name} = dataVariable;
      if (this.props.variableNameMap) {
        name = this.props.variableNameMap[dataVariable.id];
      }

      return (
        <li className='data-variable-list-item' key={index}>
          <VariablePill
            readOnly={this.props.readOnly}
            picture={this.props.picture}
            name={name}
            variable={dataVariable} />
          {this.getExpressionEditor(dataVariable)}
          <div className='dataVariable-value'>
            {value}
          </div>
        </li>
      );
    });

    let addButton = this.props.readOnly ? null : (
      <button onClick={this.handleAddVariable.bind(this)}>Add</button>
    );
    return (
      <div className="dataVariables-list-container">
        <ul className='dataVariables-list'>
          {values}
        </ul>
        {addButton}
      </div>
    );
  }

  getExpressionEditor(variable) {
    let {picture, dataValues} = this.props;
    let handleChange = this.handleDefinitionChange.bind(this, variable);
    if (variable.definition.isColor()) {
      return (
        <ColorExpressionEditor
          picture={picture}
          variableValues={dataValues}
          onChange={handleChange}
          definition={variable.definition} />
      );
    } else {
      return (
        <ExpressionEditorAndScrub
          picture={picture}
          asVector={true}
          onChange={handleChange}
          variableValues={dataValues}
          definition={variable.definition} />
      );
    }
  }

  handleDefinitionChange(variable, newDefinition) {
    if (this.props.onDefinitionChange) {
      this.props.onDefinitionChange(variable, newDefinition);
      return;
    }

    let newVariable = variable.cloneWithDefinition(newDefinition);
    // Make sure the new variable hasn't introduced cycle
    if (!newVariable.hasCycle(this.props.picture.variables)) {
      PictureActions.modifyVariable(this.props.picture, newVariable);
    } else {
      // Force rerender
      // TODO - Right now this is a hack, probably a better way to do this is to flash
      // some error message that makes us rerender anyway
      this.forceUpdate();
    }
  }

  handleAddVariable() {
    let variable = this.props.picture.generateNewVariable({
      isRow: false,
      definition: '42'
    });
    PictureActions.addVariable(this.props.picture, variable);
  }

}

DataVariableList.propTypes = {
  readOnly: React.PropTypes.bool,
  variableNameMap: React.PropTypes.object,
  dataVariables: React.PropTypes.array.isRequired,
  dataValues: React.PropTypes.object.isRequired
};

DataVariableList.defaultProps = {
  dataVariables: [],
  dataValues: {}
};
