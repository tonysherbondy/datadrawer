// Require styles
require('../styles/normalize.css');
require('font-awesome/css/font-awesome.css');
require('../styles/tukey.css');

/*eslint no-unused-vars:0*/
import React from 'react';
import Router from 'react-router';
import Biff from 'biff';

import PictureStore from 'stores/PictureStore';
import DrawingStateStore from 'stores/DrawingStateStore';
import UserStore from 'stores/UserStore';
import PictureActions from 'actions/PictureActions';
import UserActions from 'actions/UserActions';
import DrawingStateActions from 'actions/DrawingStateActions';
import pictureSerializer from 'api/PictureSerializer';
import FirebaseApi from 'api/FirebaseApi';
import ImgurApi from 'api/ImgurApi';
import routes from 'routes';

// singleton dispatcher, actions and stores
const dispatcher = new Biff();

let serializer = pictureSerializer();
let firebaseApi = new FirebaseApi({serializer});
let imgurApi = new ImgurApi();

const actions = {
  drawingState: new DrawingStateActions(dispatcher),
  picture: new PictureActions(dispatcher, firebaseApi, imgurApi),
  user: new UserActions(dispatcher, firebaseApi)
};

const pictureStore = new PictureStore(dispatcher);
const stores = {
  drawingState: new DrawingStateStore(dispatcher, pictureStore),
  picture: pictureStore,
  user: new UserStore(dispatcher)
};

const fluxContext = { actions, stores };

//pictureApi.authenticateUser().then((user) => {
  //console.log(user);
//});

Router.run(routes(), Router.HistoryLocation, (Root, state) => {
  // We pass the fluxContext as props to Main component which will make it
  // available to all descendants as part of their context.
  React.render(<Root {...state} {...fluxContext} />, document.getElementById('content'));
});
