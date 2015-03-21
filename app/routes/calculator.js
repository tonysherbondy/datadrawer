import Ember from 'ember';
import {Expression, Environment} from 'tukey/objects/variable';

var environment = Environment.create();
environment.addVariable('foo', Expression.constant('10'));
environment.addVariable('bar', Expression.constant('27'));

export default Ember.Route.extend({
  model: function() {
    return {
      environment: environment
    };
  },
  actions: {
    addVariable: function() {
      var count = environment.get('variableList.length');
      environment.addVariable(`variable ${count}`, Expression.constant(''));
    }
  }
});
