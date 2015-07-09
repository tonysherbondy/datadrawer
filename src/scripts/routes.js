import React from 'react';
import { Route, Redirect } from 'react-router';

import App from './components/App';
import Notebook from './components/Notebook';
import NotebookViewer from './components/NotebookViewer';

export default (
  <Route name="app" path="/notebook/:notebookId/picture/:pictureId" handler={App}>
    <Route name="edit" path="edit" handler={Notebook} />
    <Route name="view" path="view" handler={NotebookViewer} />
    <Redirect to="view" />
  </Route>
);
