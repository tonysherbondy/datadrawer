import DS from 'ember-data';

export function initialize(container, application) {
  application.register('store:main', DS.Store);
  application.inject('object:environment', 'store', 'store:main');
}

export default {
  name: 'store-to-environment',
  initialize: initialize
};
