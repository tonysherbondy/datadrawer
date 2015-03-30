export function initialize(container, application) {
  application.inject('object:environment', 'store', 'store:main');
}

export default {
  name: 'store-to-environment',
  initialize: initialize
};
