import React from 'react';
import {RouteHandler} from 'react-router';

// TODO - Is there a way to not need a root route that does nothing??
class Main extends React.Component {
  render() {
    return (
      <RouteHandler {...this.props} />
    );
  }
}

export default Main;
