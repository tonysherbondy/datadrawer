// Require styles
require('../styles/normalize.css');
require('font-awesome/css/font-awesome.css');
require('../styles/tukey.css');

import React from 'react';
import Router from 'react-router';
import Biff from 'biff';

import PictureStore from './stores/PictureStore';
import DrawingStateStore from './stores/DrawingStateStore';
import PictureActions from './actions/PictureActions';
import DrawingStateActions from './actions/DrawingStateActions';
import pictureSerializer from './api/PictureSerializer';
import FirebasePictureApi from './api/FirebasePictureApi';
import routes from './routes';

// singleton dispatcher, actions and stores
const dispatcher = new Biff();

let serializer = pictureSerializer();
let pictureApi = new FirebasePictureApi(serializer);

const actions = {
  drawingState: new DrawingStateActions(dispatcher),
  picture: new PictureActions(dispatcher, pictureApi)
};

const stores = {
  drawingState: new DrawingStateStore(dispatcher),
  picture: new PictureStore(dispatcher)
};

const fluxContext = { actions, stores };

Router.run(routes(), (Root, state) => {
  // We pass the fluxContext as props to Main component which will make it
  // available to all descendants as part of their context.
  React.render(<Root {...state} {...fluxContext} />, document.getElementById('content'));
});
