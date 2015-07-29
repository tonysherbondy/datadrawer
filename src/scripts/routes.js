import React from 'react';
import { Route } from 'react-router';

import App from './components/App';
import Notebook from './components/Notebook';
import NotebookViewer from './components/NotebookViewer';

export default (
  <Route name="app" path="/" handler={App}>
    <Route name="edit" path="edit" handler={Notebook} />
    <Route name="view" path="view" handler={NotebookViewer} />
  </Route>
);

