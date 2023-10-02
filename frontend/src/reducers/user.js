import {ADD_USER_CASE} from '../actions/types';

const initialState = [];

const userCasesReducer = (state = initialState, action) => {
    console.log("Reducer Payload:", action.payload);
    console.log("Action Type:", action.type);
    switch (action.type) {
        case ADD_USER_CASE:
            console.log("User Reducer:", action.payload);
            if (action.payload) {
                return action.payload;
            }
            return state;
        default:
            return state;
    }
};
export default userCasesReducer;
