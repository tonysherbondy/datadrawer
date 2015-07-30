import biff from '../dispatcher/dispatcher';
import API from '../utils/apiHelpers';

const NotebookActions = biff.createActions({
  setNotebook(notebook) {
    this.dispatch({
      actionType: 'SET_NOTEBOOK',
      notebook
    });
  },

  fetchNotebook(notebookId) {
    this.dispatch({
      actionType: 'LOADING_NOTEBOOK',
      notebookId
    });
    // Approximate slow server
    setTimeout( () => {
      API.getNotebook(notebookId)

        .then(response => {
          let {data} = response;

          if (!data) {
            this.dispatch({
              actionType: 'ERROR_LOADING_NOTEBOOK',
              notebookId,
              error: 'NOTFOUND'
            });
          } else {
            NotebookActions.setNotebook({id: notebookId, notes: data});
          }
        })

        .catch(response => {
          this.dispatch({
            actionType: 'ERROR_LOADING_NOTEBOOK',
            notebookId,
            error: response
          });
        });

    }, 1000);
  }
});

export default NotebookActions;
