import Expression from './Expression';
import {guid} from '../utils/utils';

export default class DataVariable {
  constructor({name, id, definition, isRow, prop}) {
    this.id = id || guid();
    this.name = name || id;
    this.isRow = isRow;
    // Shape variables have a prop
    this.prop = prop;
    if (definition instanceof Expression) {
      this.definition = definition;
    } else {
      if (definition == null) {
        definition = 'null';
      }
      this.definition = new Expression(definition);
    }
  }

  getDependentVariables() {
    return this.definition.getDependentVariables();
  }

  getJsName() {
    return `variables.data.${this.id}`;
  }

  getJsCode() {
    return `${this.getJsName()} = ${this.definition.getJsCode()};`;
  }

  getValue(values) {
    // Need to compute the value and not just look it up because we might have
    // shape expressions that are simply not evaluated with data right now,
    // e.g., rect's fill color
    return this.definition.evaluate(values);
  }

  cloneWithDefinition(definition) {
    let {id, name, isRow} = this;
    return new DataVariable({id, name, isRow, definition});
  }

  cloneWithNewId() {
    let {name, isRow, definition} = this;
    return new DataVariable({name, isRow, definition});
  }

  // Detect whether one of dep vars depends on this variable
  hasCycle(variables) {
    let getVariable = v => variables.find(vv => vv.id === v.id);
    let getAllDepVarsAsVars = v => v.getDependentVariables().map(getVariable);
    let depVars = getAllDepVarsAsVars(this);
    while (depVars.length > 0) {
      if (depVars.find(v => v.id === this.id)) {
        return true;
      }
      depVars = depVars.reduce((vars, v) => {
        return vars.concat(getAllDepVarsAsVars(v));
      }, []);
    }
    return false;
  }

}

// TODO Need static methods that will check if a definition already depends on
// a variable
//
// TODO Static method that checks to see if a variable is being used by
// any data variable... for deletion
