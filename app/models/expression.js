import DS from 'ember-data';
import {isString} from 'tukey/utils/common';

var Expression = DS.Model.extend({
  persistedFragments: DS.attr({defaultValue: () => []}),

  fragments: function(key, value) {
    var store = this.get('store');
    if (arguments.length > 1) {
      var serializedFragments = value.map((fragment) => {
        // Either variable id or fragment
        return isString(fragment) ? fragment : {id: fragment.get('id')};
      });
      this.set('persistedFragments', serializedFragments);
      return value;
    }
    return this.get('persistedFragments').map((fragment) => {
      if (isString(fragment)) {
        return fragment;
      }
      return store.find('variable', fragment.id);
    });
  }.property('persistedFragments'),

  variables: function() {
    var isVar = (fragment) => !isString(fragment);
    return this.get('fragments').filter(isVar);
  }.property('fragments.[]'),

  jsString: function() {
    var xform = (f) => isString(f) ? f : f.get('_internalName');
    return this.get('fragments').map(xform).join('');
  }.property('fragments', 'variables.@each._internalName', 'variables.@each.isFulfilled'),

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
