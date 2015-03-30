import Ember from 'ember';
import {guid, isString} from 'tukey/utils/common';
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

  definition: function(key, value) {
    if (arguments.length === 1) {
      return Expression.constant(0);
    } else {
      if (value instanceof Expression) {
        return value;
      } else {
        return Expression.constant(jsCodeFromValue(value));
      }
    }
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
             'environment'),

  jsCode: function() {
    return jsCodeFromValue(this.get('value'));
  }.property('value')
});

export default Variable;
