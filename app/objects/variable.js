import Ember from 'ember';
import {guid, isString} from 'tukey/utils/common';


var Variable = Ember.Object.extend({
  id: function() {
    return guid();
  }.property(),

  // named used when setting by an environment when setting up an eval context
  _internalName: function() {
    var underscoreId = this.get('id').underscore();
    return `_${underscoreId}`;
  }.property('id'),

  // name defined and seen by the user in the UI
  name: Ember.required(),

  definition: function() {
    return Expression.constant(0);
  }.property(),

  // TODO: add checking to warn people about this directly
  // use environment.addVariable(..) instead
  environment: undefined,

  value: function() {
    if (this.get('definition.isConstant')) {
      var constantString = this.get('definition.fragments.firstObject');
      // we might want to define constants using js expressions (e.g. Math.PI)
      try {
        return eval(constantString);
      } catch (error) {
        console.log('error evaluating expression');
        return 'invalid expression';
      }
    } else {
      var environment = this.get('environment');
      if (environment instanceof Environment) {
        try {
          return environment.evaluate(this.get('definition'));
        } catch (error) {
          console.log('error evaluating expression');
          return 'invalid expression';
        }
      }

      return undefined;
    }
  }.property('definition.isConstant',
             'definition.fragments.[]',
             'definition.variables.@each.value',
             'environment')
});

var Expression = Ember.Object.extend({
  fragments: function() {
    return [];
  }.property(),

  variables: function() {
    return this.get('fragments').filter(function(fragment) {
      return fragment instanceof Variable;
    });
  }.property('fragments.[]'),

  jsString: function() {
    var stringFragments = this.get('fragments').map(function(fragment) {
      if (fragment instanceof Variable) {
        return fragment.get('_internalName');
      } else if (isString(fragment)) {
        return fragment;
      }
    });

    return stringFragments.join('');
  }.property('fragments.[]', 'variables.@each._internalName'),

  isConstant: function() {
    var fragments = this.get('fragments');
    return fragments.length === 1 && isString(fragments[0]);
  }.property('fragments.[]')
});

Expression.reopenClass({
  constant: function(value) {
    return Expression.create({
      fragments: [`${value}`],
    });
  }
});

// TODO: rewrite this using ArrayProxy
// the list is meant to be the external interface that will be shown in the UI,
// but we want to have a backing hash as well to ensure that each variable is
// only added one time
var Environment = Ember.Object.extend({
  variableList: function() {
    return [];
  }.property(),

  _variables: function() {
    return Object.create(null);
  }.property(),

  _addVariable: function(variable) {
      this.get('_variables')[variable.get('id')] = variable;
      this.get('variableList').pushObject(variable);
      variable.set('environment', this);
  },

  getVariableById: function(id) {
    return this.get('_variables')[id];
  },

  addVariable: function(variable, definition) {
    if (arguments.length === 1 && variable instanceof Variable) {
      if (this.get('_variables')[variable.get('id')]) {
        Ember.Logger.warn(
          'Tried to add variable to environment that already existed');
      } else {
        this._addVariable(variable);
      }
    } else if (isString(variable) && definition instanceof Expression) {
      var name = variable;
      var newVariable = Variable.create({
        name: name,
        definition: definition,
      });
      this._addVariable(newVariable);
      return newVariable;
    } else {
      Ember.Logger.error('Must define variable with a name and Expression');
    }
  },

  // TODO: consider returning a function that can be used to evaluate
  // expressions where the context is already set up so we don't have
  // re-run the setup code every time
  _contextSetupJS: function(expression) {
    var variableAssignmentLines = [];

    expression.get('variables').forEach((variable) => {
      var varValue = this._codeRepresentation(variable.get('value'));

      if (!Ember.isNone(varValue)) {
        var varName = variable.get('_internalName');
        variableAssignmentLines.push(`var ${varName} = ${varValue};`);
      }
    });

    return variableAssignmentLines.join('\n');
  },

  evaluate: function(expression) {
    var setupCode = this._contextSetupJS(expression);
    var expressionCode = expression.get('jsString');
    var script = `(function() {${setupCode}; return (${expressionCode});})()`;
    return eval(script);
  },

  _codeRepresentation: function (value) {
    if (Ember.isArray(value)) {
      return `[${value}]`;
    } else if (isString(value)) {
      return `'${value}'`;
    } else {
      return `${value}`;
    }
  }
});

export {Variable, Expression, Environment};
