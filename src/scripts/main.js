// Require styles
require('../styles/normalize.css');
require('font-awesome/css/font-awesome.css');
require('../styles/tukey.css');

import React from 'react';
import Router from 'react-router';
import routes from './routes';

Router.run(routes, (Root, state) => {
  React.render(<Root {...state} />, document.getElementById('content'));
});

