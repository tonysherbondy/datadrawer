import Ember from "ember";

var Expression = Ember.Object.extend({
  stringRepresentation: Ember.required(),

  evaluate: function(scalars, table, element, index) { // jshint ignore:line
    return eval(this.get("stringRepresentation"));
  },

  cheapoEval: function() {
    var value;
    try {
      value = parseFloat(this.evaluate());
    } catch (error) {
      console.log("D3 CODE EVAL ERROR: " + error);
    }
    if (isFinite(value)) {
      return value;
    } else {
      return 0;
    }
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
