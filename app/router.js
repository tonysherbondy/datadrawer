import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('pivot', function() {
    this.route('simple', { path: '/' });
    this.route('politicians');
  });
  this.route('nhancat');
});

export default Router;
