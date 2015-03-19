import Ember from "ember";

var markCounter = 0;

export default Ember.Object.extend({
  name: function() {
    return `mark${++markCounter}`;
  }.property(),

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
    return `this.selectChart().selectAll('${type}').filter('.${this.get("name")}')` +
      `.data(table).enter().append('${type}')`;
  },

  getD3Attrs: function(attrsMap) {
    return `\n.attr('class', '${this.get("name")}')\n` + attrsMap.map((item) => {
      let attrFunc = this.getAttrFuncD3(item.name);
      if (!attrFunc) {
        return "";
      }
      return `.attr('${item.d3Name}', ${attrFunc})`;
    }).join("\n");
  },

  getD3Code: function() {
    var attrsMap = this.get("attrsMap");
    return this.getD3DrawPrefix(this.get("type")) + this.getD3Attrs(attrsMap) + ";";
  }

});
