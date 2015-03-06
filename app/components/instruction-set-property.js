import Ember from "ember";

export default Ember.Component.extend({
  tagName: "span",

  properties: function() {
    var commonAttrs = ["fill", "stroke", "stroke-width"];
    switch(this.get("instruction.drawParent.mark")) {
      case "rect":
        return commonAttrs.concat(["width", "height", "x", "y"]);
      case "circle":
        return commonAttrs.concat(["r", "cx", "cy"]);
      case "line":
        return commonAttrs.concat(["x1", "x2", "y1", "y2"]);

    }
  }.property("instruction.drawParent.mark"),

  selectedProperty: Ember.computed.alias("instruction.property"),
  selectedPropertyValue: Ember.computed.alias("instruction.propertyValue")
});
