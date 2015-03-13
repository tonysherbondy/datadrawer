import Ember from "ember";

export default Ember.Component.extend({
  vectorDataItems: Ember.computed(function() {
    return this.get("dataItems").filter(function(item) {
      return item.get("type") === "vector";
    });
  }).property("dataItems"),

  loopVariable: Ember.computed.oneWay("selectedLoopData.name")

});
