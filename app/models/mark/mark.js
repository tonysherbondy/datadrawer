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
    {name: "opacity", d3Name: "opacity"},
    {name: "stroke", d3Name: "stroke"},
    {name: "strokeWidth", d3Name: "stroke-width"},
  ],

  init: function() {
    this.get("attrsMap").getEach("name").forEach((name) => {
      this.addObserver(name, this.dirtyD3Code);
    });
  },

  dirtyD3Code: function() {
    this.notifyPropertyChange("d3Code");
  },

  getAttrFuncD3: function(attr) {
    if (!this.get(attr)) {
      return null;
    }
    return `function(element, index) { return ${this.get(attr + '.stringRepresentation')}; }`;
  },

  // TODO need to support "table" and eventually some subsplicing of table
  loopOver: null,

  loopOverString: function() {
    var loopOver = this.get("loopOver");
    if (!loopOver) {
      // TODO don't think we should have Ember up in here, but this is easiest null checking
      return "[table.get('firstObject')]";
    }
    return "table";
  }.property("loopOver"),

  getD3DrawPrefix: function(type) {
    return ["this.selectChart()",
      `  .selectAll('${type}.${this.get("name")}.selectable-mark')`,
      `    .data(${this.get("loopOverString")})`,
      `  .enter().append('${type}')`,
      `    .attr('class', '${this.get("name")} selectable-mark')`].join('\n');
  },

  getD3Attrs: function(attrsMap) {
    return attrsMap.map((item) => {
      let attrFunc = this.getAttrFuncD3(item.name);
      if (!attrFunc) {
        return "";
      }
      if (item.name === "text") {
        return `    .text(${attrFunc})`;
      } else {
        return `    .attr('${item.d3Name}', ${attrFunc})`;
      }
    }).filter((item) => {
      return item != null && item.length > 0;
    }).join('\n');
  },

  d3Code: function() {
    var attrsMap = this.get("attrsMap");
    return this.getD3DrawPrefix(this.get("type")) + '\n' + this.getD3Attrs(attrsMap) + ";";
  }.property()

});
