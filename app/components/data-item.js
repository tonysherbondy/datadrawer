import Ember from "ember";

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['list-group-item'],

  name: Ember.computed.alias("dataItem.name"),

  dataTypes: ["scalar", "vector"],
  dataType: function(key, value, previousValue) {
    if (arguments.length > 1) {
      if (this.get("dataItem.type") === "vector") {
        if (!Ember.isArray(this.get("dataItem.value"))) {
          this.set("dataItem.value", [this.get("dataItem.value")]);
        }
      }
    }

    return this.get("dataItem.type")
  }.property("dataItem.type"),

  textValue: function(key, value, previousValue) {
    // setter
    if (arguments.length > 1) {
      if (this.get("dataType") === "scalar") {
        this.set("dataItem.value", value);
      } else if (this.get("dataType") === "vector") {
        var array = value.split(/\s*,\s*/);
        console.log("got array value: " + array);
        this.set("dataItem.value", array);
      }
    }

    // getter
    if (this.get("dataType") === "scalar") {
      return this.get("dataItem.value");
    } else if (this.get("dataType") === "vector") {
      return this.get("dataItem.value").join(",");
    }
  }.property("dataItem.type", "dataItem.value")
});
