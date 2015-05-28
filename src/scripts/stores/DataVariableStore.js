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
  }),
  new DataVariable({
    id: 'sx',
    name: 'sx',
    isRow: true,
    definition: ['[0.08, 0.32, 0.7, 0.97, 0.81, 0.44, 0.18, 0.24]']
  }),
  new DataVariable({
    id: 'sy',
    name: 'sy',
    isRow: true,
    definition: ['[0.27, 0.63, 0.93, 0.65, 0.42, 0.12, 0.2, 0.37]']
  }),
  new DataVariable({
    id: 'swidth',
    name: 'swidth',
    isRow: true,
    definition: ['[0.04, 0.04, 0.11, 0.1, 0.09, 0.1, 0.07, 0.1]']
  }),

  // Bar Chart Data
  new DataVariable({
    id: 'numberEnergies',
    name: 'number of energies',
    definition: [{id: 'energy_in_mwh', asVector: true}, '.length']
  }),
  new DataVariable({
    id: 'top_mwh',
    name: 'Top MWh',
    definition: ['40']
  }),
  new DataVariable({
    id: 'max_energy_in_mwh',
    name: 'Max energy in MWh',
    definition: ['_.max(', {id: 'energy_in_mwh', asVector: true}, ')']
  }),
  new DataVariable({
    id: 'barWidth',
    name: 'barWidth',
    definition: ['1 / ', {id: 'numberEnergies'}]
  }),
  new DataVariable({
    id: 'energy_in_mwh',
    name: 'Energy in MWh',
    isRow: true,
    definition: ['[7.2, 29.47, 26.50, 28.2, 0.61, 6.36, 10.32, 16.08, 18.6, 19.08, 18.6]']
  }),
  new DataVariable({
    id: 'norm_energy_in_mwh',
    name: 'Norm energy in MWh',
    isRow: true,
    definition: [{id: 'energy_in_mwh', asVector: true}, '.map(function(d) { return d / ', {id: 'top_mwh'}, '});']
  })
];

const DataVariableStore = biff.createStore({
  getVariables() {
    return variables;
  },
  generateNewVariable({name, isRow, definition}) {
    let id = `v_${variables.length + 1}`;
    name = name || id;
    return new DataVariable({id, name, isRow, definition});
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
      variables = variables.concat([payload.data]);
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
    case 'MODIFY_VARIABLE': {
      let index = variables.findIndex(v => v.id === payload.data.id);
      if (index > -1) {
        let before = variables.slice(0,index);
        let after = variables.slice(index+1, variables.length);
        variables = [...before, payload.data, ...after];
        DataVariableStore.emitChange();
      }
      break;
    }
    case 'APPEND_VARIABLE': {
      variables = variables.concat([payload.data]);
      DataVariableStore.emitChange();
      break;
    }
    case 'REMOVE_DATAVARIABLE': {
      DataVariableStore._setPending(false);
      DataVariableStore._clearErrors();
      // TODO probably need to not allow removal of variables that
      // depend on each other
      variables = variables.filter(v => v.id === payload.data.id);
      DataVariableStore.emitChange();
      break;
    }
  }

});

export default DataVariableStore;
