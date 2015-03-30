import Ember from 'ember';
import DS from 'ember-data';
import {isString} from 'tukey/utils/common';
import Expression from 'tukey/models/expression.js';
import Environment from 'tukey/models/environment.js';

function jsCodeFromValue(value) {
  if (Ember.isArray(value)) {
    return `[${value}]`;
  } else if (isString(value)) {
    return `'${value}'`;
  } else {
    return `${value}`;
  }
}


var Variable = DS.Model.extend({
  // name defined and seen by the user in the UI
  name: DS.attr('string'),
  expression: DS.belongsTo('expression'),

  // named used when setting by an environment when setting up an eval context
  _internalName: function() {
    return 'var_' + this.get('id');
  }.property('id'),

  definition: function(key, value) {
    if (arguments.length === 1) {
      return this.get('expression');
    } else {
      if (value instanceof Expression) {
        this.set('expression', value);
        return value;
      } else {
        var expression = this.store.createRecord('expression');
        expression.set('fragments', [jsCodeFromValue(value)]);
        this.set('expression', expression);
        return expression;
      }
    }
  }.property('expression'),

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
             'environment'),

  jsCode: function() {
    return jsCodeFromValue(this.get('value'));
  }.property('value')
});

export default Variable;
