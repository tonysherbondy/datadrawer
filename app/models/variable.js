import Ember from 'ember';
import DS from 'ember-data';
import {jsCodeFromValue, isString} from 'tukey/utils/common';
import Expression from 'tukey/models/expression.js';
import Environment from 'tukey/models/environment.js';

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
             'definition.jsString',
             'definition.variables.@each.value',
             'environment'),

  jsCode: function() {
    return jsCodeFromValue(this.get('value'));
  }.property('value'),

  d3Code: function() {
    var fragments = this.get('definition.fragments');

    var codeStrings = fragments.map((fragment) => {
      if (!isString(fragment)) {
        if (Ember.isArray(fragment.get('value'))) {
          return `element['${fragment.get('name')}']`;
        } else {
          return fragment.get('jsCode');
        }
      }
      // fragment is string
      return fragment;
    });

    return codeStrings.join('');
  }.property('definition.jsString', 'value')
});

export default Variable;
