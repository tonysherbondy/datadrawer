import {OrderedMap} from 'immutable';
import {List} from 'immutable';

let modifierKeysMatch = function(handler, event) {
  return (!!handler.altKey === !!event.altKey) &&
    (!!handler.ctrlKey === !!event.ctrlKey) &&
    (!!handler.metaKey === !!event.metaKey) &&
    (!!handler.shiftKey === !!event.shiftKey);
};

class KeyEventManager {
  constructor(eventMap, activeHandlers) {
    if (eventMap instanceof OrderedMap ) {
      this.eventMap = eventMap;
    } else {
      this.eventMap = OrderedMap();
    }

    if (activeHandlers instanceof List) {
      this.activeHandlers = activeHandlers;
    } else {
      this.activeHandlers = List();
    }
  }

  get handlers() { return this.eventMap.valueSeq().flatten().toArray(); }
  set handlers(v) { throw `Cannot set handlers. (Tried to set to ${v})`; }

  _handleKey(event, callbackName) {
    let handlers = this.eventMap.get(event.keyCode, List());
    let handlersTriggered = List();

    handlers.forEach((handler) => {
      let callback = handler[callbackName];
      if (callback && modifierKeysMatch(handler, event)) {
        callback(event);
        handlersTriggered = handlersTriggered.push(handler);
      }
    });

    if (!handlersTriggered.isEmpty()) {
      return new KeyEventManager(this.eventMap, handlersTriggered);
    }

    return this;
  }

  handleKeyDown(e) {
    return this._handleKey(e, 'keyDown');
  }

  handleKeyUp(e) {
    return this._handleKey(e, 'keyUp');
  }

  registerHandler(handler) {
    if (!handler.keyCode || (!handler.keyDown && !handler.keyUp)) {
      throw 'key handler must specify a keyCode and at least one of keyDown \
        or keyUp';
    }
    // append to list of handlers for this keyCode or create a new list
    let handlers = this.eventMap.get(handler.keyCode, List());
    handlers = handlers.push(handler);
    let eventMap = this.eventMap.set(handler.keyCode, handlers);

    return new KeyEventManager(eventMap);
  }
}

export default KeyEventManager;
