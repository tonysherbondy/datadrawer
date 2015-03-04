import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('shapes', { path: '/' });
  this.route('politicians');
  this.route('campaign');
  this.route('proxy');
});

export default Router;
