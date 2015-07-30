import biff from '../dispatcher/dispatcher';

// Can be [init, loading, loaded, error]
let notebookStatus = 'init';
let notebook = null;

const NotebookStore = biff.createStore({
  getNotebookStatus() {
    return notebookStatus;
  },
  getNotebook() {
    return notebook;
  }
}, payload => {
  switch (payload.actionType) {
    case 'LOADING_NOTEBOOK': {
      notebookStatus = 'loading';
      notebook = null;
      NotebookStore.emitChange();
      break;
    }
    case 'ERROR_LOADING_NOTEBOOK': {
      notebookStatus = 'error';
      notebook = null;
      NotebookStore.emitChange();
      break;
    }
    case 'SET_NOTEBOOK': {
      notebookStatus = 'loaded';
      notebook = payload.notebook;
      NotebookStore.emitChange();
      break;
    }
  }
});

export default NotebookStore;
