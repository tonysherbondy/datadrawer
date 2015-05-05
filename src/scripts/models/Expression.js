import evaluateJs from '../utils/evaluateJs';

function isVar(fragment) {
  return fragment.id;
}

export default class Expression {
  constructor(fragments) {
    if (!fragments) {
      this.fragments = [];
    } else if (fragments instanceof Array) {
      this.fragments = fragments;
    } else {
      this.fragments = [fragments];
    }
  }

  getDependentVariables() {
    return this.fragments.filter(isVar);
  }

  getJsName(fragment, index) {
    return Expression.getDataOrShapePropJs(fragment, index);
  }

  getJsCode(index) {
    // fragments of definition are either variables
    // or strings
    return this.fragments.map(fragment => {
      if (isVar(fragment)) {
        return this.getJsName(fragment, index);
      }
      return fragment;
    }).join('');
  }

  evaluate(variables, index) {
    return evaluateJs(this.getJsCode(index), variables);
  }
}

// TODO Can probably convert this to shape name now instead of object
Expression.getShapeVarName = function(shape, index) {
  return `utils.getShapeVariable('${shape.id}', ${index})`;
};

Expression.getDataOrShapePropJs = function(variable, index) {
  if (variable.prop) {
    // Shape property
    let varName = Expression.getShapeVarName(variable, index);
    return `${varName}.getProp('${variable.prop}')`;
  } else {
    // Data variable
    let varString = `{id: '${variable.id}', asVector: ${variable.asVector}}`;
    return `utils.getData(${varString}, ${index})`;
  }
};
