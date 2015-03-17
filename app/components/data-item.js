import Ember from "ember";

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['list-group-item'],

  name: Ember.computed.alias("dataItem.name"),

  dataTypes: ["scalar", "vector"],
  dataType: function(key, value) {
    if (arguments.length > 1) {
      this.set("dataItem.type", value);
      this._convertDataItemValue(value);
      return value;
    } else {
      return this.get("dataItem.type");
    }
  }.property("dataItem.type"),

  _convertDataItemValue: function(type) {
      var value = this.get("dataItem.value");

      if (type === "vector" && !Ember.isArray(value)) {
        this.set("dataItem.value", [value]);
      }

      if (type === "scalar" && Ember.isArray(value)) {
        var scalarValue = value.get("firstObject");
        this.set("dataItem.value", scalarValue);
      }
  },

  textValue: function(key, value) {
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
