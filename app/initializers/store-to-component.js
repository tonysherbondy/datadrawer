import DS from 'ember-data';

// TODO: this initializer exists so that certain components
// can save objects to the Ember Data store. Saving should
// probably be done through a controller, so we will want to
// remove this initializer after refactoring
export function initialize(container, application) {
  application.register('store:main', DS.Store);
  application.inject('component', 'store', 'store:main');
}

export default {
  name: 'store-to-component',
  initialize: initialize
};
