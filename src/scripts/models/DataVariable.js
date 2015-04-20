
let counter = 0;
function getNewID() {
  return `data_${counter++}`;
}

export default class DataVariable {
  constructor({name, id, definition}) {
    this.id = id || getNewID();
    this.name = name;
    this.definition = definition;
  }

  getDependentVariables() {
    // TODO Handle definitions with more than one variable
    if (this.definition instanceof DataVariable) {
      return [this.definition];
    }
    return [];
  }

  getJsName() {
    return `variables.data.${this.id}`;
  }

  getJsCode(prevVarsMap) {
    let value = '';
    // TODO Handle multiple variables and array
    if (this.definition instanceof DataVariable) {
      value = this.definition.getJsName();
    } else {
      value = `${this.definition}`;
    }
    return `${this.getJsName()} = ${value};`;
  }
}
