function userActions(userApi) {
  return {
    authenticate() {
      this.dispatch({ actionType: 'AUTHENTICATING' });
      userApi.authenticateUser().then((user) => {
        this.dispatch({
          actionType: 'AUTHENTICATED',
          user
        });
      }).catch((error) => {
        this.dispatch({
          actionType: 'AUTHENTICATION_FAILURE',
          error
        });
      });
    }
  };
}

export default class {
  constructor(dispatcher, userApi) {
    return dispatcher.createActions(userActions(userApi));
  }
}
