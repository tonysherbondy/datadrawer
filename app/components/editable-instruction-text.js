import Ember from 'ember';

export default Ember.Component.extend({
  operation: Ember.computed.alias("instruction.operation"),
  mark: Ember.computed.alias("instruction.mark"),
  attrs: Ember.computed.alias("instruction.attrs"),

  isLoop: Ember.computed.equal("operation", "loop"),
  isDraw: Ember.computed.equal("operation", "draw"),

  displayableAttrs: function() {
    // sometimes currentInstruction set to null and our component is still rendering??
    if (!this.get("instruction")) {
      return [];
    }
    // turn into array of name, stringRepresentation
    var attrs = this.get("attrs");
    var names = Object.keys(attrs);
    return names.map((name) => {
      let stringRepresentation = attrs[name].get("stringRepresentation");
      return Ember.Object.create({name, stringRepresentation});
    });
  }.property("attrs"),

  attrsText: function() {
    return this.get("displayableAttrs").map((attr) => {
      return `${attr.get("name")}: ${attr.get("stringRepresentation")}`;
    }).join(", ");
  }.property("displayableAttrs")

});
