import React from 'react';
import _ from 'lodash';
import VariablePill from '../VariablePill';
import ExpressionEditorAndScrub from '../ExpressionEditorAndScrub';
import ColorExpressionEditor from '../ColorExpressionEditor';

class DataVariableList extends React.Component {

  render() {
    let {scalars} = this.props.dataVariables.reduce((map, d) => {
      let type = d.isRow ? 'vectors' : 'scalars';
      map[type].push(d);
      return map;
    }, {scalars: [], vectors: []});

    let values = scalars.map((dataVariable, index) => {
      let value = dataVariable.getValue(this.props.dataValues, this.props.currentLoopIndex);
      if (_.isNumber(value)) {
        value = Math.round(value * 100) / 100;
      }

      // Allow for overriding variable names
      let {name} = dataVariable;
      if (this.props.variableNameMap) {
        // TODO - such an ugly way to handle the fact that the id for shape
        // variables will be the same, because the id is the shape id. Really,
        // we just need to refactor so that ShapeVariables are treated differently
        if (dataVariable.prop) {
          name = this.props.variableNameMap[`${dataVariable.id}_${dataVariable.prop}`];
        } else {
          name = this.props.variableNameMap[dataVariable.id];
        }
      }

      return (
        <li className='data-variable-list-item' key={index}>
          <VariablePill
            readOnly={this.props.readOnly}
            picture={this.props.picture}
            name={name}
            variable={dataVariable} />
          {this.getExpressionEditor(dataVariable)}
          {this.getValueUi(dataVariable, value)}
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
    if (variable.isReadOnly) { return null; }
    let {picture, dataValues} = this.props;
    let handleChange = this.handleDefinitionChange.bind(this, variable);
    return (
      <ExpressionEditorAndScrub
        picture={picture}
        asVector={this.props.asVector}
        onChange={handleChange}
        variableValues={dataValues}
        definition={variable.definition} />
    );
  }

  getValueUi(variable, value) {
    if (variable.definition.isColor()) {
      let handleChange = this.handleDefinitionChange.bind(this, variable);
      return (
        <ColorExpressionEditor
          picture={this.props.picture}
          variableValues={this.props.dataValues}
          onChange={handleChange}
          definition={variable.definition} />
      );
    } else {
      return (
        <div className='dataVariable-value'>
          {value}
        </div>
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
      this.context.actions.picture.modifyVariable(this.props.picture, newVariable);
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
    this.context.actions.picture.addVariable(this.props.picture, variable);
  }

}

DataVariableList.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  })
};

DataVariableList.propTypes = {
  asVector: React.PropTypes.bool.isRequired,
  readOnly: React.PropTypes.bool,
  variableNameMap: React.PropTypes.object,
  dataVariables: React.PropTypes.array.isRequired,
  currentLoopIndex: React.PropTypes.number,
  dataValues: React.PropTypes.object.isRequired
};

DataVariableList.defaultProps = {
  dataVariables: [],
  dataValues: {}
};

export default DataVariableList;
