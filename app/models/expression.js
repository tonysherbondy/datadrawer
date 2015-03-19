import Ember from "ember";

var Expression = Ember.Object.extend({
  stringRepresentation: Ember.required(),

  //jshint unused:false
  evaluate: function(scalars, table, element, index) {
    return eval(this.get("stringRepresentation"));
  }
});

Expression.e = function e(stringRep) {
  return Expression.create({
    stringRepresentation: stringRep
  });
};

export default Expression;
