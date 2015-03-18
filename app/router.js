import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('four', {path: '/'});
  this.route('campaign');
  this.route('marks');

  // Old pivot table
  this.route('shapes');
  this.route('politicians');
  this.route('proxy');
});

export default Router;
