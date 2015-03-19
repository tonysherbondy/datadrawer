import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('four', {path: '/'});
  this.route('marks');
});

export default Router;
