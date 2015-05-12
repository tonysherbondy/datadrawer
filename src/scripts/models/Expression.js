import _ from 'lodash';
import evaluateJs from '../utils/evaluateJs';

// Fragments can be variable, shape property or strings
function fragmentType(fragment) {
  if (_.isString(fragment)) {
    return 'string';
  }

  if (fragment.id) {
    if (fragment.prop) {
      return 'property';
    }
    return 'variable';
  }

  return 'unknown';
}

function isVar(fragment) {
  return fragmentType(fragment) === 'variable';
}


export default class Expression {
  constructor(fragments) {
    if (fragments === null || fragments === undefined) {
      this.fragments = [];
    } else if (fragments instanceof Array) {
      this.fragments = this.normalizeFragments(fragments);
    } else {
      this.fragments = this.normalizeFragments([fragments]);
    }
  }

  normalizeFragments(fragments) {
    // Can only be strings or objects with id
    return fragments.map(f => {
      if (fragmentType(f) === 'unknown') {
        return '' + f;
      }
      return f;
    });
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
      let type = fragmentType(fragment);
      if (type === 'string') {
        return fragment;
      }
      return this.getJsName(fragment, index);
    }).join('');
  }

  evaluate(variables, index) {
    return evaluateJs(this.getJsCode(index), variables);
  }

  equal(other) {
    let oFragments = other.fragments;
    if (oFragments.length !== this.fragments.length) {
      return false;
    }
    this.fragments.every((fragment, i) => {
      if (fragment.id) {
        return fragment.id === oFragments[i].id;
      }
      return fragment === oFragments[i];
    });
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
