import React from 'react';
import Flux from '../dispatcher/dispatcher';
import Immutable from 'immutable';


export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let stuff = Immutable.Range(1,this.props.number).map(num => {
      return (
        <li key={num}>{num}</li>
      );
    });
    return (
      <div>
        <h1>Hello, stupid.</h1>
        <input type="text" />
        <ul>
          {stuff}
        </ul>
      </div>
    );
  }
}

App.propTypes = {number: React.PropTypes.number};
