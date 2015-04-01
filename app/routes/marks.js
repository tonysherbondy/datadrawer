import Ember from 'ember';
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default Ember.Route.extend({
  getTable: function() {
    var columns = [
        {name: "Nhan", age: 27, weight: 120},
        {name: "Zack", age: 30, weight: 160},
        {name: "Anthony", age: 37, weight: 180}
    ];
    var tableColumns = columns.map((hash) => {
      var column = this.get("store").createRecord('tableColumn');
      column.get("cells").pushObjects(this.getCellsFromHash(hash));
      return column;
    });
    var table = this.get("store").createRecord('table');
    table.get("columns").pushObjects(tableColumns);
    return table;
  },

  getCellsFromHash: function(hash) {
    var cells = [];
    var store = this.get("store");
    Object.keys(hash).forEach(function(key) {
      cells.pushObject(store.createRecord('tableCell', {
        name: key,
        value: hash[key]
      }));
    });
    return cells;
  },

  getScalars: function() {
    var someScalars = [
      {name: 'canvasHeight', value: 200},
      {name: 'canvasWidth', value: 200},
      {name: 'padding', value: 3}
    ].map((hash) => v(hash.name, hash.value));
    var markVar = v('mark1_center_x', 0);
    var depVar = v('dependsOnCenter', markVar);
    return someScalars.concat([markVar, depVar]);
  },

  getInstructionTree: function() {
    //var singleDrawOp = this.get("store").createRecord('instruction', {
        //operation: "draw",
        //mark: "rect",
        //markId: 1
    //});

    //singleDrawOp.set("attrs", {
      //top: e("10"),
      //left: e("10"),
      //width: e("100"),
      //height: e("100"),
      //opacity: e("0.3")
    //});
    //var setOp = this.get("store").createRecord('instruction', {
        //operation: "set",
        //property: "height",
        //propertyValue: 50
    //});
    //setOp.set("attrs", {
      //// TODO - these are probably computed from something
      //height: e("50")
    //});
    //singleDrawOp.addSubInstruction(setOp);

    //var loopedDrawOp = this.get("store").createRecord('instruction', {
      //operation: "draw",
      //mark: "circle",
      //markId: 2
    //});
    //loopedDrawOp.set("attrs", {
      //radius: e("5"),
      //cy: e("element.age"),
      //cx: e("element.weight"),
      //opacity: e("0.7"),
      //fill: e("'#49B08D'")
    //});

    //var loopOp = this.get("store").createRecord('instruction', {
      //operation: "loop"
    //});
    //loopOp.addSubInstruction(loopedDrawOp);

    var root = this.get("store").createRecord('instruction', {
        operation: "root",
    });
    //root.addSubInstruction(singleDrawOp);
    //root.addSubInstruction(loopOp);
    return root;
  },

  model: function() {
    // setup the environment
    Environment.defaultEnvironment.set('store', this.store);
    window.defaultEnvironment = Environment.defaultEnvironment;
    var picture = this.get("store").createRecord("picture", {
      instructionTree: this.getInstructionTree(),
      table: this.getTable()
    });

    picture.get("scalars").pushObjects(this.getScalars());
    return picture;
  }
});
