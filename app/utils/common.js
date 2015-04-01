import Ember from 'ember';

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function isString(s) {
  return typeof s === 'string' || s instanceof String;
}

function jsCodeFromValue(value) {
  if (Ember.isArray(value)) {
    var values = value.map(jsCodeFromValue).join(', ');
    return `[${values}]`;
  } else if (isString(value)) {
    return `'${value}'`;
  } else {
    return `${value}`;
  }
}

export {guid, isString, jsCodeFromValue};
