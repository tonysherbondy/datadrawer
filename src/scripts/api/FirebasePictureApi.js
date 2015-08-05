import $ from 'jquery';
import {pictureToJson, pictureFromJson} from './PictureSerializer';
import PiePreset from '../stores/piePreset';
import BarsPreset from '../stores/barsPresetPicture';
import ScatterPreset from '../stores/scatterPresetPicture';
import LinePreset from '../stores/linePreset';

//let baseUrl = 'https://datadrawer.firebaseio.com/';
let baseUrl = 'https://dashdrawer.firebaseio.com/';

class FirebasePictureApi {
  savePicture(picture) {
    return Promise.resolve($.ajax({
      url: `${baseUrl}/pictures/${picture.id}.json`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(pictureToJson(picture))
    }));
  }

  savePresets() {
    return Promise.all([
      this.savePicture(PiePreset.get()),
      this.savePicture(BarsPreset.get()),
      this.savePicture(ScatterPreset.get()),
      this.savePicture(LinePreset.get())
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
      return pictureJsonValues.map(pictureFromJson);
    });
  }
}

export default new FirebasePictureApi();
