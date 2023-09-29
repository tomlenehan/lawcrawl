import { ADD_USER_CASE } from '../actions/types';

const initialState = [];

const userCasesReducer = (state = initialState, action) => {
  console.log("Reducer Payload:", action.payload);
  switch (action.type) {
    case ADD_USER_CASE:
      return action.payload;
    default:
      return state;
  }
};

export default userCasesReducer;
