import Ember from "ember";

var Expression = Ember.Object.extend({
  stringRepresentation: Ember.required(),

  evaluate: function(scalars, table, element, index) { // jshint ignore:line
    return eval(this.get("stringRepresentation"));
  }
});

Expression.reopenClass({
  e: function(stringRep) {
    return Expression.create({
      stringRepresentation: stringRep
    });
  }
});

export default Expression;
