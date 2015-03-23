import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('marks', {path: '/'});
  this.route('calculator');
  this.resource('pictures', {path: '/pictures'}, function() {
    this.resource('picture', {path: '/:picture_id'});
  });
});

export default Router;
