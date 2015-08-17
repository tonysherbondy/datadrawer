import $ from 'jquery';
import Firebase from 'firebase';

import User from '../models/User';
import piePreset from '../stores/presets/piePreset';
import barsPreset from '../stores/presets/barsPreset';
import scatterPreset from '../stores/presets/scatterPreset';
import linePreset from '../stores/presets/linePreset';

const baseUrl = 'https://datadrawer.firebaseio.com/';

class FirebaseApi {
  constructor({serializer, firebaseRef, localStorage}) {
    this.serializer = serializer;
    this.firebaseRef = firebaseRef || new Firebase(baseUrl);
    this.localStorage = localStorage || window.localStorage;

    // We manually manage connection state so that we limit the number of
    // active connections.
    // TODO: this is undesired if we we have other firebase instances since it
    // will globally disconnect. We should ask Firebase for an API that is not
    // static/global.
    Firebase.goOffline();
    this.isAuthenticating = false;
    this.user = null;
  }

  authenticateUser() {
    if (this.isAuthenticating) {
      return Promise.reject(
        new Error('cannot authenticate while there is a pending request'));
    }

    let user = this._loadUserFromLocalStorage();
    if (user) {
      this.user = user;
      return Promise.resolve(user);
    }

    return new Promise((resolve, reject) => {
      // Only be online for authentication (everything else is through REST)
      // TODO: this will break if we need to make multiple online requests to
      // firebase.  Currently we only use it to authenticate so that we don't
      // need our own server for JSON Web Token generation.
      // We should ask Firebase for an API that is not static/global here.
      this.isAuthenticating = true;
      Firebase.goOnline();
      this.firebaseRef.authAnonymously((error, authData) => {
        Firebase.goOffline();
        this.isAuthenticating = false;
        if (error) {
          reject(error);
        }
        let newUser = new User({
          id: authData.uid,
          token: authData.token
        });
        this._saveUserToLocalStorage(newUser);
        this.user = newUser;
        resolve(newUser);
      });
    });
  }

  getParams() {
    if (this.user) {
      return `?auth=${this.user.token}`;
    }

    return '';
  }

  // TODO: we should check that the notebook.ownerId matches the user.id
  // otherwise don't even send the request
  savePicture(notebookId, picture) {
    return Promise.resolve($.ajax({
      url: `${baseUrl}/notebooks/${notebookId}/pictures/${picture.id}.json${this.getParams()}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(this.serializer.pictureToJson(picture))
    }));
  }

  saveNotebook(notebook) {
    return Promise.resolve($.ajax({
      url: `${baseUrl}/notebooks/${notebook.id}.json${this.getParams()}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(this.serializer.notebookToJson(notebook))
    }));
  }

  savePresets() {
    return Promise.all([
      this.savePicture(piePreset()),
      this.savePicture(barsPreset()),
      this.savePicture(scatterPreset()),
      this.savePicture(linePreset())
    ]);
  }

  loadNotebook(notebookId) {
    let fetchNotebook = Promise.resolve($.getJSON(`${baseUrl}/notebooks/${notebookId}.json${this.getParams()}`));

    return fetchNotebook.then((notebookJson) => {
      if (!notebookJson) {
        throw new Error('notebook not found');
      }
      return this.serializer.notebookFromJson(notebookJson);
    });
  }

  _loadUserFromLocalStorage() {
    let id = localStorage.getItem('datadrawer.userId');
    let token = localStorage.getItem('datadrawer.userToken');
    if (id && token) {
      return new User({ id, token });
    }
    return null;
  }

  _saveUserToLocalStorage(userToSave) {
    localStorage.setItem('datadrawer.userId', userToSave.id);
    localStorage.setItem('datadrawer.userToken', userToSave.token);
  }
}

export default FirebaseApi;
