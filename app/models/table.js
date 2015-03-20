import Ember from "ember";
import TableColumn from "tukey/models/table-column";

export default Ember.Object.extend({
  columns: Ember.required(),

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
