import React from 'react';

import App from './components/App';
import { Route } from 'react-router';

export default (
  <Route name="app" path="/" handler={App} />
);

