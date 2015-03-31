import Ember from "ember";


export default Ember.Object.extend({
  // Whoever creates mark must give it unique name
  name: Ember.required(),

  // Assume that the draw instruction that creates this mark will set itself
  drawInstruction: null,

  // TODO Need a way to have attrsMap be something that is an appendable property,
  // i.e., subclassing adds to it rather than replaces, then we need to add observers
  // dynamically
  concatenatedProperties: ["attrsMap"],
  attrsMap: [
    {name: "fill", d3Name: "fill"},
    {name: "opacity", d3Name: "opacity"},
    {name: "stroke", d3Name: "stroke"},
    {name: "transform", d3Name: "transform"},
    {name: "strokeWidth", d3Name: "stroke-width"},
  ],

  externalVariablesHash: function() {
    // return a hash of name to value, basically like the control points
    // So probably needs to be overridden by every type
  }.property(),

  getAttrByName: function(name) {
    return this.get('attrs').findBy('name', name);
  },

  rotation: function() {
    var transform = this.get("transform");
    if (Ember.isEmpty(transform)) {
      return 0;
    }
    // assume the transform is format "translate rotate
    transform = transform.evaluate();
    var rotate = transform.split(' ')[1];
    var rotateNum = rotate.split('(')[1].split(')')[0];
    return parseFloat(rotateNum);
  }.property("attrs.transform"),

  init: function() {
    this.get("attrsMap").getEach("name").forEach((name) => {
      this.addObserver(name, this.dirtyD3Code);
    });
  },

  dirtyD3Code: function() {
    this.notifyPropertyChange("d3Code");
  },

  getAttrFuncD3: function(attrName) {
    var attribute = this.get('attrs').findBy('name', attrName);

    if (!attribute) {
      return null;
    }

    //TODO (nhan): reconsider the way we're getting the value of these expressions
    //perhaps the outputted d3 code should refer to variables that are initialized
    //earlier in the code
    return `function(element, index) { return ${attribute.get('variable.jsCode')}; }`;
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
