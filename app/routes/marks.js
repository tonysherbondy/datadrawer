import Ember from 'ember';

var Table = Ember.Object.extend({
});

var Mark = Ember.Object.extend({
  table: function() {
    return Table.create({
      rows: {
        names: ['Nhan', 'Zack', 'Anthony'],
        ages: [27, 30, 37]
      }
    });
  }.property()
});

var RectangleMark = Mark.extend({
});

export default Ember.Route.extend({
  model: function() {
    return Mark.create();
  }
});
