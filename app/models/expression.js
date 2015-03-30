import DS from 'ember-data';
import Variable from 'tukey/models/variable';
import {isString} from 'tukey/utils/common';

var Expression = DS.Model.extend({
  persistedFragments: DS.hasMany('fragment'),

  fragments: function(key, value) {
    var store = this.get('store');
    if (arguments.length > 1) {
      var fragments2 = value.map((payload) => {
        var stringFragment = isString(payload) ? payload : null;
        var variableFragment = isString(payload) ? null : payload;
        return store.createRecord('fragment', {
          stringFragment: stringFragment,
          variableFragment: variableFragment
        });
      });
      this.get('persistedFragments').clear();
      this.get('persistedFragments').pushObjects(fragments2);
      return value;
    }
    return this.get('persistedFragments').getEach('payload');
  }.property('persistedFragments'),

  variables: function() {
    var isVar = (fragment) => fragment instanceof Variable;
    return this.get('fragments').filter(isVar);
  }.property('fragments.[]'),

  jsString: function() {
    var xform = (f) => isString(f) ? f : f.get('_internalName');
    return this.get('fragments').map(xform).join('');
  }.property('fragments', 'variables.@each._internalName'),

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

export default Expression;
