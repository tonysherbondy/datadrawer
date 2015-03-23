export function initialize(container, application) {
   application.inject('component', 'keyboardManager', 'service:keyboard-manager');
}

export default {
  name: 'keyboard-manager',
  initialize: initialize
};
