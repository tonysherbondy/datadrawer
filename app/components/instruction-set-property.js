import Ember from "ember";

export default Ember.Component.extend({
  tagName: "span",

  properties: function() {
    var commonAttrs = ["fill", "stroke", "stroke-width"];
    switch(this.get("instruction.parentInstruction.mark")) {
      case "rect":
        return commonAttrs.concat(["width", "height", "x", "y"]);
      case "circle":
        return commonAttrs.concat(["r", "cx", "cy"]);
      case "line":
        return commonAttrs.concat(["x1", "x2", "y1", "y2"]);

    }
  }.property("instruction.parentInstruction.mark"),

  selectedProperty: Ember.computed.alias("instruction.property"),
  selectedPropertyValue: function(key, value) {
    var dataType = this.get("selectedDataItem.type");

    //setter
    if (arguments.length > 1) {
      if (dataType === "custom") {
        this.set("customDataValue", value);
      } else if (!!this.get("selectedDataItem")) {
        this.set("selectedDataItem.value", value);
      }
      return value;
    }

    // getter
    if (dataType === "custom") {
      return this.get("customDataValue");
    } else {
      return this.get("selectedDataItem.value");
    }

  }.property("selectedDataItem.{value,type}", "customDataValue"),

  propertyValues: function() {
    var ret = this.get("dataItems").filterBy("type", "scalar");

    ret.pushObjects(this.get("instruction.availableLoopVariables").map(function(varName) {
      return {
        name: varName,
        type: "loop variable"
      }
    }));

    ret.pushObject({
      name: "custom value: ",
      type: "custom"
    });

    return ret;
  }.property("dataItems.[]", "instruction.availableLoopVariables.[]"),

  isCustomValue: Ember.computed.equal("selectedDataItem.type", "custom")
  //this.set("instruction.propertyValue", value);
});
