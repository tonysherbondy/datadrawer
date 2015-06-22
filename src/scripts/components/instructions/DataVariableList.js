import React from 'react';
import VariablePill from '../VariablePill';
import ExpressionEditorAndScrub from '../ExpressionEditorAndScrub';
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
      value = Math.round(value * 100) / 100;

      return (
        <li className='data-variable-list-item' key={index}>
          <VariablePill picture={this.props.picture} variable={dataVariable} />
          <ExpressionEditorAndScrub
            picture={this.props.picture}
            asVector={true}
            onChange={this.handleDefinitionChange.bind(this, dataVariable)}
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
  dataVariables: React.PropTypes.array,
  dataValues: React.PropTypes.object
};

DataVariableList.defaultProps = {
  dataVariables: [],
  dataValues: {}
};
