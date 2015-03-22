import Ember from 'ember';

// From https://github.com/KasperTidemann/ember-contenteditable-view/blob/master/ember-contenteditable-view.js
export default Ember.Component.extend({
	tagName: 'span',
	attributeBindings: ['contenteditable'],

	// Variables:
	editable: false,
	isUserTyping: false,
	plaintext: false,

  value: Ember.computed.oneWay("bufferedValue"),

	// Properties:
	contenteditable: (function() {
		var editable = this.get('editable');

		return editable ? 'true' : undefined;
	}).property('editable'),

	// Processors:
  processValue: function() {
    if (!this.get('isUserTyping') && this.get('value')) {
      return this.setContent();
    }
  },

	// Observers:
	valueObserver: (function() {
    Ember.run.once(this, 'processValue');
  }).observes('value', 'isUserTyping'),

	// Events:
	didInsertElement: function() {
		return this.setContent();
	},

	focusOut: function() {
    // TODO hacky api to tell upstream to actually edit value of attr
    this.sendAction("editUpstreamValue", this.get("value"));
		return this.set('isUserTyping', false);
	},

	keyDown: function(event) {
		if (!event.metaKey) {
			return this.set('isUserTyping', true);
		}
	},

	keyUp: function(event) { //jshint ignore:line
		if (this.get('plaintext')) {
			return this.set('value', this.$().text());
		} else {
			return this.set('value', this.$().html());
		}
	},

	//render our own html so there are no metamorphs to get screwed up when the user changes the html
  render: function(buffer) {
    buffer.push(this.get('value'));
  },

	setContent: function() {
    // TODO might not need this hack with my blur action
    var el$ = this.$();
    if (el$) {
      return el$.html(Ember.Handlebars.Utils.escapeExpression(this.get('value')));
    }
	}
});
