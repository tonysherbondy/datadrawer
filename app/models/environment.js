import Ember from 'ember';
import Variable from 'tukey/models/variable.js';
import Expression from 'tukey/models/expression.js';
import {isString, jsCodeFromValue} from 'tukey/utils/common';

// TODO: rewrite this using ArrayProxy
// the list is meant to be the external interface that will be shown in the UI,
// but we want to have a backing hash as well to ensure that each variable is
// only added one time
var Environment = Ember.Object.extend({

  store: function() {
    return this.container.lookup('store:main');
  }.property(),

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

  // TODO(tony) may want to make this a hash as well
  getVariableByName: function(name) {
    return this.get('variableList').findBy('name', name);
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
      var newVariable = this.get('store').createRecord('variable', {
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
      var varName = variable.get('_internalName');
      var value = variable.get('value');

      if (!Ember.isArray(value)) {
        var firstValueCode = jsCodeFromValue(value.get('firstObject'));
        variableAssignmentLines.push(`var ${varName} = ${firstValueCode};`);
      } else if (value !== undefined && value !== null) {
        var valueCode = jsCodeFromValue(value);
        variableAssignmentLines.push(`var ${varName} = ${valueCode};`);
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
});

Environment.reopenClass({
  defaultEnvironment: Environment.create(),
  v: function(varName, value) {
    var environment = Environment.defaultEnvironment;
    var fragment;
    if (value instanceof Variable) {
      fragment = value;
    } else {
      fragment = jsCodeFromValue(value);
    }
    var store = environment.get('store');
    var expression = store.createRecord('expression');
    expression.set('fragments', [fragment]);
    return environment.addVariable(varName, expression);
  }
});

export default Environment;
