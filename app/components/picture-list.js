import Ember from 'ember';
import layout from '../templates/components/picture-list';

export default Ember.Component.extend({
  layout: layout,

  savedPictures: Ember.computed(function() {
    return this.get("pictures").filter(function(picture) {
      return !picture.get("isNew");
    });
  }).property("pictures.[]")
});
