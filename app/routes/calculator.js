import Ember from 'ember';
import Environment from 'tukey/models/environment';
import Expression from 'tukey/models/expression';

var environment = Environment.create();
var v = Environment.v;

environment.addVariable(v('foo', 10));
environment.addVariable(v('bar', 27));

export default Ember.Route.extend({
  model: function() {
    return {
      environment: environment
    };
  },
  actions: {
    addVariable: function() {
      var count = environment.get('variableList.length');
      environment.addVariable(v(`variable ${count}`, ''));
    }
  }
});
