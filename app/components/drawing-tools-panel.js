import Ember from "ember";

export default Ember.Component.extend({
  modeList: null,

  drawingModes: Ember.computed.filter("modeList", (mode) => mode.modeName.match(/draw/)),
  adjustModes: Ember.computed.filter("modeList", (mode) => mode.modeName.match(/adjust/)),
  flowModes: Ember.computed.filter("modeList", (mode) => mode.modeName.match(/flow/))
});
