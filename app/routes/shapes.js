import Ember from 'ember';

export default Ember.Route.extend({
  templateName: 'pivot',

  model: function() {
    return {
      data: [
        {color: "blue", shape: "circle"},
        {color: "red", shape: "trianble"},
      ],
      keys: ["color", "shape"]
    };
  }
});
