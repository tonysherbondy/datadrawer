import Ember from 'ember';
import Environment from 'tukey/models/environment';
import Expression from 'tukey/models/expression';

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
