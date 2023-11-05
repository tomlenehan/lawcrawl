import {ADD_USER_CASE} from '../actions/types';

const initialState = [];

const userCasesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER_CASE:
            if (action.payload) {
                return action.payload;
            }
            return state;
        default:
            return state;
    }
};
export default userCasesReducer;
