import $ from 'jquery';

// TODO: rewrite these files to use new?
import piePreset from '../stores/presets/piePreset';
import barsPreset from '../stores/presets/barsPreset';
import scatterPreset from '../stores/presets/scatterPreset';
import linePreset from '../stores/presets/linePreset';

const baseUrl = 'https://datadrawer.firebaseio.com/';

class FirebasePictureApi {
  constructor(serializer) {
    this.serializer = serializer;
  }

  savePicture(notebookId, picture) {
    return Promise.resolve($.ajax({
      url: `${baseUrl}/notebooks/${notebookId}/pictures/${picture.id}.json`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(this.serializer.pictureToJson(picture))
    }));
  }

  saveNotebook(notebook) {
    return Promise.resolve($.ajax({
      url: `${baseUrl}/notebooks/${notebook.id}.json`,
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
    let fetchNotebook = Promise.resolve($.getJSON(`${baseUrl}/notebooks/${notebookId}.json`));

    return fetchNotebook.then((notebookJson) => {
      if (!notebookJson) {
        throw new Error('notebook not found');
      }
      return this.serializer.notebookFromJson(notebookJson);
    });
  }
}

export default FirebasePictureApi;
