import Expression from './Expression';

let counter = 0;
function getNewID() {
  return `data_${counter++}`;
}

export default class DataVariable {
  constructor({name, id, definition, isRow}) {
    this.id = id || getNewID();
    this.name = name;
    this.isRow = isRow;
    if (definition instanceof Expression) {
      this.definition = definition;
    } else {
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
    return values.data[this.id];
  }

  cloneWithDefinition(definition) {
    let {id, name, isRow} = this;
    return new DataVariable({id, name, isRow, definition});
  }
}

// TODO Need static methods that will check if a definition already depends on
// a variable
//
// TODO Static method that checks to see if a variable is being used by
// any data variable... for deletion
