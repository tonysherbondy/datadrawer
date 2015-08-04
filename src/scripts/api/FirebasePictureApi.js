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

  savePicture(picture) {
    return Promise.resolve($.ajax({
      url: `${baseUrl}/pictures/${picture.id}.json`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(this.serializer.pictureToJson(picture))
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

  loadAllPictures(initialized) {
    let fetchPictures = Promise.resolve($.getJSON(`${baseUrl}/pictures.json`));

    return fetchPictures.then((pictureIdMap) => {
      if (!pictureIdMap && !initialized) {
        return this.savePresets().then(() => this.loadAllPictures(true));
      }

      let pictureJsonValues =
        Object.keys(pictureIdMap).map(id => pictureIdMap[id]);
      return pictureJsonValues.map(this.serializer.pictureFromJson);
    });
  }
}

export default FirebasePictureApi;
