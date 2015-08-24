import React from 'react';
import { Route, Redirect } from 'react-router';

import App from './components/App';
import Main from './components/Main';
import NotebookEditor from './components/NotebookEditor';
import NotebookViewer from './components/NotebookViewer';
import NotebookNotFound from './components/NotebookNotFound';

function routes() {
  return (
    <Route name="main" path="/" handler={Main}>
      <Route name="app" path="/notebook/:notebookId/picture/:pictureId" handler={App}>
        <Route name="edit" path="edit" handler={NotebookEditor} />
        <Route name="view" path="view" handler={NotebookViewer} />
        <Redirect to="edit" />
      </Route>
      <Route name="notebookNotFound" path="notebook-not-found" handler={NotebookNotFound} />
      <Redirect to="/notebook/default/picture/bars/edit" />
    </Route>
  );
}

export default routes;
