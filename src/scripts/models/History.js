import {List} from 'immutable';

class History {
  constructor(states, currentIndex) {
    this.states = states;
    this.currentIndex = currentIndex;
  }

  currentState() {
    return this.states.get(this.currentIndex);
  }

  redo() {
    if (this.currentIndex + 1 < this.states.size) {
      return new History(this.states, this.currentIndex + 1);
    }
    return this;
  }

  undo() {
    if (this.currentIndex > 0) {
      return new History(this.states, this.currentIndex - 1);
    }
    return this;
  }

  // overwrite current state without adding to history
  replaceCurrent(state) {
    let states = this.states.take(this.currentIndex).push(state);
    return new History(states, this.currentIndex);
  }

  append(state) {
    let states = this.states.take(this.currentIndex + 1).push(state);
    return new History(states, this.currentIndex + 1);
  }
}

History.of = function(initialState) {
  return new History(List.of(initialState), 0);
};

export default History;
