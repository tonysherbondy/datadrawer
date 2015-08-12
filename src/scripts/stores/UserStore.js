function userStore(props) {

  // authenticated, unauthenticated, pending, failure
  let authenticationState = 'unauthenticated';
  let user;

  function getUser() {
    return user;
  }

  function getAuthenticationState() {
    return authenticationState;
  }

  function handleAction(payload) {
    switch (payload.actionType) {
      case 'AUTHENTICATING': {
        authenticationState = 'pending';
        props.fluxStore.emitChange();
        break;
      }

      case 'AUTHENTICATED': {
        authenticationState = 'authenticated';
        user = payload.user;
        props.fluxStore.emitChange();
        break;
      }

      case 'AUTHENTICATION_FAILURE': {
        authenticationState = 'failure';
        user = null;
        props.fluxStore.emitChange();
      }
    }
  }

  return {
    accessors: {
      getUser,
      getAuthenticationState
    },
    actionHandler: handleAction
  };
}

export default class {
  constructor (dispatcher) {
    //TODO: Come up with a better wrapper around Biff or use a different Flux
    //library.  This is pretty janky.
    let props = {};
    let store = userStore(props);

    // this assignment is necessary so that we have acess to the result of
    // dispatcher.createStore()
    props.fluxStore = dispatcher.createStore(store.accessors,
                                             store.actionHandler);
    return props.fluxStore;
  }
}
