import DS from 'ember-data';

export default DS.Model.extend({
  // each row is a variable with an array as its value
  rows: DS.hasMany('variable'),

  numColumns: function() {
    var lengths = this.get("rows").map((row) => {
      return row.get('value.length');
    });

    return lengths.reduce((a, b) => {
      return a > b ? a : b;
    }, 0);
  }.property('rows.[]'),

  columnHashes: function() {
    var ret = [];
    for (var i = 0; i < this.get('numColumns'); i++) {
      var columnHash = Object.create(null);
      this.get('rows').forEach((row) => {
        var array = row.get('value');
        if (i < array.length) {
          // TODO: (nhan) need better handling of name conflicts here
          columnHash[row.get('name')] = array[i];
        }
      });
      ret.pushObject(columnHash);
    }
    return ret;
  }.property('rows.@each.value', 'rows.@each.name')
});
