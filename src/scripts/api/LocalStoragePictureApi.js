import Immutable from 'immutable';
import {pictureToJson, pictureFromJson} from './PictureSerializer';
import PiePreset from '../stores/piePreset';
import BarsPreset from '../stores/barsPresetPicture';
import ScatterPreset from '../stores/scatterPresetPicture';
import LinePreset from '../stores/linePreset';
let LocalStorage = window.localStorage;

class LocalStoragePictureApi {
  getItem(key) {
    return Promise.resolve(LocalStorage.getItem(key));
  }

  setItem(key, item) {
    return Promise.resolve(LocalStorage.setItem(key, item));
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

      let pictureJsonString = JSON.stringify(pictureToJson(picture));
      let setPicture = this.setItem(picture.id, pictureJsonString);

      return Promise.all([setKeys, setPicture]);
    });
  }

  savePresets() {
    // TODO: these need to sequential for now due to above bug where
    // multiple saves can overwrite picture keys
    return this.savePicture(PiePreset.get())
      .then(() => this.savePicture(BarsPreset.get()))
      .then(() => this.savePicture(ScatterPreset.get()))
      .then(() => this.savePicture(LinePreset.get()));
  }

  loadPicture(id) {
    return this.getItem(id).then(JSON.parse).then(pictureFromJson);
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

export default new LocalStoragePictureApi();
