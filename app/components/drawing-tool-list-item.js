import Ember from "ember";

export default Ember.Component.extend({
  tagName: "li",
  classNameBindings: ["isActive"],
  activeDrawingMode: null,
  isActive: function() {
    return this.get("mode.modeName") === this.get("activeDrawingMode");
  }.property("activeDrawingMode", "mode.modeName")
});
