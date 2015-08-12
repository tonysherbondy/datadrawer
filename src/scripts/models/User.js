import {Record} from 'immutable';

// TODO: move this to its own file
let User = Record({
  id: 'unauthenticated',
  token: 'unauthenticated-token'
});

export default User;
