import {OrderedMap} from 'immutable';
import {guid} from '../utils/utils';
import Picture from './Picture';

class Notebook {
  constructor(props = {}) {
    this.id = props.id || guid();
    this.name = props.name || 'Untitled';

    if (props.pictures) {
      if (props.pictures instanceof OrderedMap) {
        this.pictures = props.pictures;
      } else {
        this.pictures = OrderedMap(props.pictures);
      }
    } else {
      let emptyPicture = new Picture();
      this.pictures = OrderedMap([
        [emptyPicture.id, emptyPicture]
      ]);
    }
  }
}

export default Notebook;
