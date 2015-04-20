
let counter = 0;
function getNewID() {
  return `data_${counter++}`;
}

function isVar(v) {
  return v instanceof DataVariable;
}

function getAllDescendentVariables(definition) {
  let depVars = definition.filter(isVar);
  if (depVars.length === 0) {
    return [];
  }
  return depVars.reduce((all, v) => {
    return all.concat(getAllDescendentVariables(v.definition));
  }, depVars);
}

export default class DataVariable {
  constructor({name, id, definition}) {
    this.id = id || getNewID();
    this.name = name;

    // TODO, before setting definition, make sure
    // no descendents are equal to me
    let descendents = getAllDescendentVariables(definition);
    if (!descendents.every(dV => dV.id !== id)) {
      // We have a cycle
      console.error('Variable definition cycle detected');
      return;
    }
    this.definition = definition;
  }

  getDependentVariables() {
    return this.definition.filter(isVar);
  }

  getJsName() {
    return `variables.data.${this.id}`;
  }

  getJsCode(prevVarsMap) {
    // fragments of definition are either variables
    // or strings
    let value = this.definition.map(fragment => {
      if (isVar(fragment)) {
        return fragment.getJsName();
      }
      return fragment;
    }).join('');
    return `${this.getJsName()} = ${value};`;
  }

  // TODO Let's move this to the store as only the store should do this
  setDefinition(definition) {
    return new DataVariable({name: this.name, id: this.id, definition});
  }
}
