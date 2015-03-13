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
  selectedPropertyValue: function(key, value, previousValue) {
    // TODO: setter might receive binding from instruction.propertyValue
    // in instruction-item.hbs.  Behavior will be wrong in this case.
    // getter
    if (this.get("selectedDataItem.type") === "custom") {
      return this.get("customDataValue");
    }
    return this.get("selectedDataItem.value");
  }.property("selectedDataItem.value", "customDataValue"),

  propertyValues: function() {
    return this.get("dataItems").filterBy("type", "scalar");
  }.property("dataItems")

  //this.set("instruction.propertyValue", value);
});
