import biff from '../dispatcher/dispatcher';
import {OrderedMap} from 'immutable';
import Picture from '../models/Picture';
import barsPicture from './barsPresetPicture';
import scatterPicture from './scatterPresetPicture';
import {guid} from '../utils/utils';

let pictures = OrderedMap();
pictures = pictures.set(barsPicture.id, barsPicture);
pictures = pictures.set(scatterPicture.id, scatterPicture);

if (pictures.size === 0) {
  // Can't have an empty picture list as we always need one picture
  let p = new Picture(guid(), [], []);
  pictures = pictures.set(p.id, p);
}

const PictureStore = biff.createStore({
  getPictures() {
    return pictures.valueSeq().toArray();
  },

  getPicture(id) {
    return pictures.get(id);
  }
}, (payload) => {
  switch (payload.actionType) {
    case 'ADD_NEW_PICTURE': {
      let picture = new Picture(guid(), [], []);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }

    case 'ADD_VARIABLE': {
      let picture = payload.picture.addVariable(payload.variable);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }

    case 'MODIFY_VARIABLE': {
      let picture = payload.picture.addVariable(payload.variable);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }

    case 'REMOVE_VARIABLE': {
      let picture = payload.picture.removeVariable(payload.variable);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }

    case 'ADD_INSTRUCTION': {
      let picture = payload.picture.addInstruction(payload.instruction);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }

    case 'REMOVE_INSTRUCTIONS': {
      let picture = payload.picture.removeInstructions(payload.instructions);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }

    case 'MODIFY_INSTRUCTION': {
      let picture = payload.picture.updateInstruction(payload.instruction);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }

    case 'INSERT_INSTRUCTION': {
      let {picture, instruction, index, parent} = payload;
      picture = picture.insertInstructionAtIndexWithParent(
        index, parent, instruction);
      pictures = pictures.set(picture.id, picture);
      PictureStore.emitChange();
      break;
    }
  }
});

export default PictureStore;
