import biff from '../dispatcher/dispatcher';

const DataVariableActions = biff.createActions({

  addDataVariable(variable) {

    this.dispatch({
      actionType: 'ADD_VARIABLE_START'
    });

    // Simulate Async Call
    setTimeout(() => {

      if (variable !== '') {
        this.dispatch({
          actionType: 'ADD_VARIABLE_SUCCESS',
          data: variable
        });
      } else {
        this.dispatch({
          actionType: 'ADD_VARIABLE_ERROR'
        });
      }

    }, 600);

  },
  removeDataVariable(index) {
    this.dispatch({
      actionType: 'REMOVE_VARIABLE',
      data: index
    });
  }
});

export default DataVariableActions;

