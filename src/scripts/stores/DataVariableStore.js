import biff from '../dispatcher/dispatcher';
import DataVariable from '../models/DataVariable';

let variables = [
  new DataVariable({
    id: 'd3',
    name: 'gamma',
    definition: [{id: 'd1'}, '+', {id: 'd2'}]
  }),
  new DataVariable({
    id: 'd1',
    name: 'alpha',
    definition: ['42']
  }),
  new DataVariable({
    id: 'd2',
    name: 'beta',
    definition: [{id: 'd1'}]
  }),
  new DataVariable({
    id: 'd4',
    name: 'aOverG',
    definition: [{id: 'd1'}, '/', {id: 'd3'}]
  }),
  new DataVariable({
    id: 'd5',
    name: 'ages',
    isRow: true,
    definition: ['[37, 27, 28]']
  }),
  new DataVariable({
    id: 'd6',
    name: 'longer',
    isRow: true,
    definition: ['[0.1, 0.2, 0.4, 0.6, 0.8, 1]']
  }),
  new DataVariable({
    id: 'd7',
    name: 'scales',
    isRow: true,
    definition: ['[4, 2, 1, 0.7, 0.5, 0.3]']
  })
];

const DataVariableStore = biff.createStore({
  getVariables() {
    return variables;
  }
}, (payload) => {

  switch (payload.actionType) {
    case 'ADD_DATAVARIABLE_START': {
      DataVariableStore._clearErrors();
      DataVariableStore._setPending(true);
      DataVariableStore.emitChange();
      break;
    }
    case 'ADD_DATAVARIABLE_SUCCESS': {
      // TODO maybe the actions handle whether or not there is a cycle??
      variables = variables.push(payload.data);
      DataVariableStore._setPending(false);
      DataVariableStore.emitChange();
      break;
    }
    case 'ADD_DATAVARIABLE_ERROR': {
      DataVariableStore._setPending(false);
      DataVariableStore._setError('DataVariable must have data');
      DataVariableStore.emitChange();
      break;
    }
    case 'REMOVE_DATAVARIABLE': {
      // TODO probably need to not allow removal of variables that
      // depend on each other
      DataVariableStore._setPending(false);
      DataVariableStore._clearErrors();
      variables = variables.delete(payload.data);
      DataVariableStore.emitChange();
      break;
    }
  }

});

export default DataVariableStore;
