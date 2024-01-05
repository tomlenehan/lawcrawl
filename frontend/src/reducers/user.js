import {ADD_USER_CASE, UPDATE_USER_CASES} from '../actions/types';

const initialState = [];

const userCasesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER_CASE:
            if (action.payload) {
                return action.payload;
            }
            return state;
        case UPDATE_USER_CASES:
            return action.payload;
        default:
            return state;
    }
};
export default userCasesReducer;
