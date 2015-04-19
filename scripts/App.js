import React from 'react';

export default class App extends React.Component {
  render() {
    let stuff = [1, 2, 3].map(num => {
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
