import Ember from 'ember';
import DS from 'ember-data';
import Variable from 'tukey/models/variable';
import {isString} from 'tukey/utils/common';

var Expression = DS.Model.extend({
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

export default Expression;
