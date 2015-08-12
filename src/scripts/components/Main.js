import React from 'react';
import {RouteHandler} from 'react-router';
import shallowEqual from 'react/lib/shallowEqual';
import _ from 'lodash';

// This corresponds to the FluxComponent in many flux implementations
// such as vanilla Biff.  We need this component to set up the context
// and register listeners for all the stores.
//
// Note that React.withContext is deprecated so this is the preferred way
// to set up the context.
class Main extends React.Component {
  // TODO verify that this gets merged with the context from the router

  getChildContext() {
    return {
      actions: this.props.actions
    };
  }

  getStateFromStores(stores) {
    let drawingState = stores.drawingState.getDrawingState();
    // Need to do this to have a record of previous apiState o.w.
    // drawingState object needs to be immutable
    let {apiState} = drawingState;
    return {
      notebook: stores.picture.getNotebook(),
      pictures: stores.picture.getPictures(),
      apiState,
      drawingState,
      user: stores.user.getUser(),
      authenticationState: stores.user.getAuthenticationState()
    };
  }

  getState(props) {
    return this.getStateFromStores(props.stores);
  }

  componentDidMount() {
    _.values(this.props.stores).forEach(store => {
      store.addChangeListener(this.handleChangeFromStore.bind(this));
    });
    this.setState(this.getState(this.props));
  }

  // TODO: should we move to purely passing props along and get rid of state
  // in this component?  This would require require using shouldComponentUpdate
  // and/or some kind of PureRender
  componentWillReceiveProps(nextProps) {
    // TODO: check props here
    if (!shallowEqual(nextProps, this.props)) {
      this.setState(this.getState(nextProps));
    }
  }

  componentWillUnmount() {
    this.setState(this.getState(this.props));
    _.values(this.props.stores).forEach(store => {
      store.removeChangeListener(this.handleChangeFromStore.bind(this));
    });
  }

  handleChangeFromStore() {
    this.setState(this.getState(this.props));
  }

  render() {
    return (
      <RouteHandler {...this.getState(this.props)}/>
    );
  }
}

Main.childContextTypes = {
  actions: React.PropTypes.shape({
    drawingState: React.PropTypes.object.isRequired,
    picture: React.PropTypes.object.isRequired
  })
};

export default Main;
