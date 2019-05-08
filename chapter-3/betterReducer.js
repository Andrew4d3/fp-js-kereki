// This is a regular reducer:
function doAction(state = initialState, action) {
  let newState = {};
  switch (action.type) {
    case "CREATE":
      // update state, generating newState,
      // depending on the action data
      // to create a new item
      return newState;
    case "DELETE":
      // update state, generating newState,
      // after deleting an item
      return newState;
    case "UPDATE":
      // update an item,
      // and generate an updated state
      return newState;
    default:
      return state;
  }
}

// There's a better to do this, using a "dispatch" table
const dispatchTable = {
  CREATE: (state, action) => {
    // update state, generating newState,
    // depending on the action data
    // to create a new item
    return newState;
  },
  DELETE: (state, action) => {
    // update state, generating newState,
    // after deleting an item
    return newState;
  },
  UPDATE: (state, action) => {
    // update an item,
    // and generate an updated state
    return newState;
  }
};

// So our reducer will be:
function doAction2(state = initialState, action) {
  return dispatchTable[action.type]
    ? dispatchTable[action.type](state, action)
    : state;
}

// way more simple!
