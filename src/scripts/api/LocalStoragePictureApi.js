import Immutable from 'immutable';
import piePreset from '../stores/presets/piePreset';
import barsPreset from '../stores/presets/barsPreset';
import scatterPreset from '../stores/presets/scatterPreset';
import linePreset from '../stores/presets/linePreset';

class LocalStoragePictureApi {
  constructor(serializer, localStorage) {
    this.serializer = serializer;
    this.localStorage = localStorage || window.localStorage;
  }

  getItem(key) {
    return Promise.resolve(this.localStorage.getItem(key));
  }

  setItem(key, item) {
    return Promise.resolve(this.localStorage.setItem(key, item));
  }

  getPictureKeys() {
    return this.getItem('__picture_keys')
      .then((pictureKeysJsonString) => {
        if (pictureKeysJsonString) {
          return Immutable.fromJS(JSON.parse(pictureKeysJsonString));
        } else {
          return Immutable.List();
        }
      });
  }

  // TODO: bug here where picture keys gets overwritten by multiple
  // async saves
  savePicture(picture) {
    return this.getPictureKeys().then((pictureKeys) => {
      let setKeys = Promise.resolve(true);

      if (!pictureKeys.has(picture.id)) {
        pictureKeys = pictureKeys.push(picture.id);
        let pictureKeysJsonString = JSON.stringify(pictureKeys.toJSON());
        setKeys = this.setItem('__picture_keys', pictureKeysJsonString);
      }

      let pictureJsonString =
        JSON.stringify(this.serializer.pictureToJson(picture));
      let setPicture = this.setItem(picture.id, pictureJsonString);

      return Promise.all([setKeys, setPicture]);
    });
  }

  savePresets() {
    // TODO: these need to sequential for now due to above bug where
    // multiple saves can overwrite picture keys
    return this.savePicture(piePreset())
      .then(() => this.savePicture(barsPreset()))
      .then(() => this.savePicture(scatterPreset()))
      .then(() => this.savePicture(linePreset()));
  }

  loadPicture(id) {
    return this.getItem(id).then(JSON.parse).then(
      this.serializer.pictureFromJson);
  }

  loadAllPictures(initialized) {
    return this.getPictureKeys().then((pictureKeys) => {
      if (pictureKeys.isEmpty() && !initialized) {
        return this.savePresets().then(() => this.loadAllPictures(true));
      }

      return Promise.all(pictureKeys.map((p) => this.loadPicture(p)));
    });
  }
}

export default LocalStoragePictureApi;
