
let counter = 0;
function getNewID() {
  return `data_${counter++}`;
}

function isVar(fragment) {
  return fragment.id;
}

export default class DataVariable {
  constructor({name, id, definition}) {
    this.id = id || getNewID();
    this.name = name;
    this.definition = definition;
  }

  getDependentVariables() {
    return this.definition.filter(isVar);
  }

  getJsName(id = this.id) {
    return `variables.data.${id}`;
  }

  getJsCode(prevVarsMap) {
    // fragments of definition are either variables
    // or strings
    let value = this.definition.map(fragment => {
      if (isVar(fragment)) {
        return this.getJsName(fragment.id);
      }
      return fragment;
    }).join('');
    return `${this.getJsName()} = ${value};`;
  }

  getValue(values) {
    return values.data[this.id];
  }
}

// TODO Need static methods that will check if a definition already depends on
// a variable
//
// TODO Static method that checks to see if a variable is being used by
// any data variable... for deletion
