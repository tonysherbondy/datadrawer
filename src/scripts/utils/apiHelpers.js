import axios from 'axios';

let firebaseApi = 'https://dashdrawer.firebaseio.com/';
var apiHelpers = {

  setPicturesForNotebook(notebookId, pictures) {
    console.log('should set pictures for notebook', notebookId, pictures);
    //firebaseRef.child(notebookId).set({pictures}, error => {
      //if (error) {
        //console.log('problem saving to firebase: ', error);
      //} else {
        //console.log('huzzah, notes saved!');
      //}
    //});
  },

  // Returns a promise
  getNotebook(notebookId) {
    return axios.get(`${firebaseApi}/${notebookId}.json`);
  }
};

export default apiHelpers;
