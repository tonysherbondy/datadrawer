export function initialize(container, application) {
   application.inject('component', 'valueSlider', 'service:value-slider');
}

export default {
  name: 'value-slider',
  initialize: initialize
};
