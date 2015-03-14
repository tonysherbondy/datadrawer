import Ember from "ember";

export default Ember.Component.extend({
  vectorDataItems: Ember.computed(function() {
    return this.get("dataItems").filter(function(item) {
      return item.get("type") === "vector";
    });
  }).property("dataItems"),


  // we want to propagate this value to instruction.loopVariable
  // default to selectedLoopData.name
  // unless the loop variable has been specified
  loopVariable: function(key, value, previous) {
    if (arguments.length > 1) {
      this.set("instruction.loopVariable", value);
    }

    if (!!this.get("instruction.loopVariable")) {
      return this.get("instruction.loopVariable");
    }

    return this.get("selectedLoopData.name");

  }.property("selectedLoopData.name", "instruction.loopVariable")
});
