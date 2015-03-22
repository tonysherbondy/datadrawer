import Ember from 'ember';

export default Ember.Component.extend({
  operation: Ember.computed.alias("instruction.operation"),
  mark: Ember.computed.alias("instruction.mark"),
  attrs: Ember.computed.alias("instruction.attrs"),

  displayText: function() {
    var operation = this.get("operation");
    if (operation === "loop") {
      return "Loop over table";
    } else if (operation === "draw") {
      return `Draw a ${this.get("mark")} with ${this.get('attrsText')}`;
    } else {
      return `Adjust ${this.get("attrsText")}`;
    }
  }.property("operation", "mark"),

  displayableAttrs: function() {
    // turn into array of name, stringRepresentation
    var attrs = this.get("attrs");
    var names = Object.keys(attrs);
    return names.map((name) => {
      let stringRepresentation = attrs[name].get("stringRepresentation");
      return Ember.Object.create({name, stringRepresentation});
    });
  }.property("attrs"),

  attrsText: function() {
    // sometimes currentInstruction set to null and our component is still rendering??
    if (!this.get("instruction")) {
      return "";
    }
    return this.get("displayableAttrs").map((attr) => {
      return `${attr.get("name")}: ${attr.get("stringRepresentation")}`;
    }).join(", ");
  }.property("displayableAttrs")

});
