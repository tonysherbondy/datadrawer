import Ember from 'ember';
import layout from 'tukey/templates/components/expression-editor';
import VariablePill from 'tukey/components/variable-pill';
import {isString} from 'tukey/utils/common';

 // node is text node
function isTextNode(node) {
  return node.nodeType === 3;
}

export default Ember.Component.extend({
  layout: layout,
  tagName: 'span',
  classNames: ['expression-editor'],
  attributeBindings: ['contenteditable'],
  contenteditable: 'true',

  cursorFragmentIndex: undefined,
  cursorOffset: 0,

  getCursorLocation: function() {
    var element = this.$().get(0);
    var node;
    var offset;

    var selection = window.getSelection();
    if (selection) {
      var range = selection.getRangeAt(0);
      if (range) {
        // sometimes the range will be relative to the parent node
        // we convert it always be relative to a child nodes
        // node = undefined, means editor is empty
        if (range.startContainer === element) {
          if (range.startOffset < element.childNodes.length) {
            node = element.childNodes[range.startOffset];
            offset = 0;
          } else {
            node = element.childNodes[element.childNodes.length - 1];
            if (node) {
              //node is guaranteed to be a text node due to the render function
              offset = node.length;
            } else {
              // this case happens when the editor is empty
              offset = 0;
            }
          }
        } else { // range starts in child node
          node = range.startContainer;
          offset = range.startOffset;
        }
      }
    }

    return {
      node: node,
      offset: offset
    };
  },

  input: function() {
    // if we just dropped a variable pill we need to reset its content editable
    // attribute to false and update the cursor location to the end of the drop
    this.$('.variable-pill').attr('contenteditable', 'false');
    this.updateCursorLocation();

    // the remainder of this method is dedicated to converting the nodes in
    // our contenteditable to fragments
    var newFragments = [];
    var element = this.$().get(0);
    var nodes = element.childNodes;

    // we will also get the cursor location and transform it to
    // "fragment space" while we are converting the nodes to fragments
    var cursorLocation = this.getCursorLocation();
    // cursorFragmentIndex === -1 means the editor is empty
    var cursorFragmentIndex = -1;
    var cursorOffset = cursorLocation.offset;

    var lastFragment;
    // make sure we always have a text fragment at the start
    // this is so the cursor will appear if it is before a variable
    if (Ember.isEmpty(nodes) || isTextNode(nodes[0])) {
      lastFragment = '';
    } else {
      lastFragment = ' ';
    }
    for (var i = 0; i < nodes.length; ++i) {
      // if current node is where cursor is located save the index
      // and compute the correct offset
      if (cursorLocation.node === nodes[i]) {
        if (isString(lastFragment)) {
          cursorOffset = cursorOffset + lastFragment.length;
          cursorFragmentIndex = newFragments.length;
        } else {
          cursorOffset = cursorOffset;
          // we will be pushing lastFragment since
          // the node type of fragment and lastfragment are different
          cursorFragmentIndex = newFragments.length + 1;
        }
      }

      var fragment = this.nodeToFragment(nodes[i]);
      if (isString(lastFragment) && isString(fragment)) {
        // consolidate consecutive string nodes
        lastFragment = lastFragment + fragment;
      } else if (!isString(lastFragment) && !isString(fragment)) {
        // insert space in between consecutive variables
        newFragments.push(lastFragment);
        newFragments.push(' ');
        lastFragment = fragment;
      } else {
        newFragments.push(lastFragment);
        lastFragment = fragment;
      }

    }

    newFragments.push(lastFragment);
    if (!isString(lastFragment)) {
      newFragments.push(' ');
    }


    console.log(newFragments);
    console.log(`cursorFragmentIndex ${cursorFragmentIndex}`);
    console.log(`cursorOffset ${cursorOffset}`);

    this.set('cursorFragmentIndex', cursorFragmentIndex);
    this.set('cursorOffset', cursorOffset);
    this.set('expression.fragments', newFragments);
  },

  nodeToFragment: function(node) {
      if (isTextNode(node)) {
        return node.data;
      } else if (node.hasAttribute && node.hasAttribute('data-variable-id')) {
        var varId = node.getAttribute('data-variable-id');
        var variable = this.get('environment').getVariableById(varId);
        return variable;
      } else {
        Ember.Logger.warn(`failed fragment for node to fragment: ${node}`);
        return '';
      }
  },

  updateCursorLocation: function() {
    var cursorLocationMarker = this.$(`#${VariablePill.cursorLocationId}`);
    if (!Ember.isEmpty(cursorLocationMarker)) {
      console.log('updating cursor location');
      this.moveCursorToBefore(cursorLocationMarker.get(0));
      cursorLocationMarker.remove();
    }
  },

  moveCursorToBefore: function(cursorNode) {
    window.getSelection().removeAllRanges();
    var range = document.createRange();
    range.setStart(cursorNode, 0);
    range.setEnd(cursorNode, 0);
    window.getSelection().addRange(range);
  },

  renderExpression: function() {
    var fragments = this.get('expression.fragments');
    var htmlString = '';

    if (this.get('cursorFragmentIndex') === -1) {
      htmlString += `<span id="${VariablePill.cursorLocationId}"></span>`;
    }

    for (var i = 0; i < fragments.length; ++i) {
      var fragment = fragments[i];
      if (isString(fragment)) {
        if (this.get('cursorFragmentIndex') === i) {
          var offset = this.get('cursorOffset');
          fragment = fragment.slice(0, offset).replace(/ /g, '&nbsp;') +
            `<span id="${VariablePill.cursorLocationId}"></span>` +
            fragment.slice(offset).replace(/ /g, '&nbsp;');
        } else {
          fragment = fragment.replace(/ /g, '&nbsp;');
        }
        htmlString += fragment;
      } else {
        var varId = fragment.get('id');
        var varName = fragment.get('name');
        htmlString += `<span class="variable-pill" contenteditable="false" ` +
          `draggable="true" data-variable-id="${varId}">${varName}</span>`;
      }
    }

    this.$().html(htmlString);
    this.updateCursorLocation();
  }.observes('expression.fragments.[]','expression.variables.@each.name'),

  didInsertElement: function() {
    this.renderExpression();
  },

  focusOut: function() {
    this.set('cursorFragmentIndex', undefined);
  }
});
