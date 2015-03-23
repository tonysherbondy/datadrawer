import DS from 'ember-data';

export default DS.Model.extend({
  columns: DS.hasMany('tableColumn'),

  rows: function() {
    var columns = this.get("columns");
    var rowNames = this.get("columns.firstObject.rowNames");
    return rowNames.map((name) => {
      return columns.map((column) => {
        return column.cellByName(name);
      });
    });
  }.property("columns.@each.columnHash")
});
