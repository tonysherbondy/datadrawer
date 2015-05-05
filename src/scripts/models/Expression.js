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

  // TODO - use get Data or Shape function
  getJsName(id) {
    return `variables.data.${id}`;
  }

  getJsCode() {
    // fragments of definition are either variables
    // or strings
    return this.fragments.map(fragment => {
      if (isVar(fragment)) {
        return this.getJsName(fragment.id);
      }
      return fragment;
    }).join('');
  }

  evaluate(variables) {
    console.log('evaluate expression with variables context', variables);
  }
}
