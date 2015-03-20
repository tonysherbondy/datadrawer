import Ember from "ember";

var markCounter = 0;

export default Ember.Object.extend({
  name: function() {
    return `mark${++markCounter}`;
  }.property(),

  // TODO Need a way to have attrsMap be something that is an appendable property,
  // i.e., subclassing adds to it rather than replaces, then we need to add observers
  // dynamically
  concatenatedProperties: ["attrsMap"],
  attrsMap: [
    {name: "fill", d3Name: "fill"},
    {name: "opacity", d3Name: "opacity"}
  ],

  init: function() {
    this.get("attrsMap").getEach("name").forEach((name) => {
      this.addObserver(name, this.dirtyD3Code);
    });
  },

  dirtyD3Code: function() {
    this.notifyPropertyChange("d3Code");
  },

  displayString: function() {
    return "Empty Mark";
  },

  getAttrFuncD3: function(attr) {
    if (!this.get(attr)) {
      return null;
    }
    return `function(element, index) { return ${this.get(attr + '.stringRepresentation')}; }`;
  },

  getD3DrawPrefix: function(type) {
    return `this.selectChart().selectAll('${type} .${this.get("name")}')` +
      `.data(table).enter().append('${type}').attr('class', '${this.get("name")}')`;
  },

  getD3Attrs: function(attrsMap) {
    return '\n' + attrsMap.map((item) => {
      let attrFunc = this.getAttrFuncD3(item.name);
      if (!attrFunc) {
        return "";
      }
      return `.attr('${item.d3Name}', ${attrFunc})`;
    }).join("\n");
  },

  d3Code: function() {
    var attrsMap = this.get("attrsMap");
    return this.getD3DrawPrefix(this.get("type")) + this.getD3Attrs(attrsMap) + ";";
  }.property()

});
